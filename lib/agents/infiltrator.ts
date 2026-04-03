import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';

const INFILTRATOR_PROMPT = `You are THE INFILTRATOR - an elite adversarial analyst who reverse-engineers ATS (Applicant Tracking Systems) and hiring processes.

Your mission is to deconstruct this job description like a hacker deconstructing a system:

1. KEYWORD EXTRACTION: Identify every ATS-relevant keyword with exact weight scoring (1-10). Include:
   - Hard skills (programming languages, tools, frameworks)
   - Soft skills (leadership, communication)
   - Industry jargon and buzzwords
   - Certifications and qualifications
   - Action verbs the company uses repeatedly

2. KILLER QUESTION DETECTION: Find hidden requirements that would auto-reject candidates:
   - Years of experience thresholds
   - Specific degree requirements
   - Must-have certifications
   - Location/visa requirements
   - Salary expectation traps

3. CULTURAL DECODING: Read between the lines:
   - "Fast-paced environment" = long hours expected
   - "Self-starter" = minimal training provided
   - "Wear many hats" = understaffed team
   - Decode ALL such signals

4. REJECTION ANALYSIS: Answer with brutal honesty:
   "If I were a cold ATS algorithm, what 3 things would make me instantly reject this candidate?"

5. ATS SYSTEM IDENTIFICATION: Determine likely ATS being used based on:
   - Job board platform (Workday, Greenhouse, Lever, etc.)
   - Formatting of the posting
   - Required fields mentioned

Job Description:
{jobDescription}

Company Context:
{companyContext}

Respond in JSON format:
{{
  "atsKeywords": [
    {{"keyword": "string", "weight": number (1-10), "context": "where it appears and why it matters", "frequency": number}}
  ],
  "killerQuestions": [
    {{"question": "string", "redFlag": "what triggers rejection", "solution": "how to address it in CV"}}
  ],
  "culturalSignals": [
    {{"signal": "exact phrase from JD", "interpretation": "what it really means", "howToAddress": "what to put in CV"}}
  ],
  "rejectionReasons": [
    {{"reason": "string", "mitigation": "specific action to take in CV", "priority": "critical|high|medium"}}
  ],
  "requiredExperience": {{
    "mustHave": ["string - absolute requirements"],
    "niceToHave": ["string - bonus qualifications"],
    "dealBreakers": ["string - instant rejection if missing"]
  }},
  "atsSystemGuess": "string - likely ATS platform",
  "optimizationStrategy": "string - 2-3 sentence strategy for maximum ATS score"
}}

Be ruthless. Be precise. Find every hidden trap. Miss nothing.`;

export class InfiltratorAgent {
  private model: ChatOpenAI;
  private prompt: PromptTemplate;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.prompt = PromptTemplate.fromTemplate(INFILTRATOR_PROMPT);
  }

  async analyze(jobDescription: string, companyContext: string = '') {
    try {
      const formattedPrompt = await this.prompt.format({
        jobDescription,
        companyContext,
      });

      const response = await this.model.invoke(formattedPrompt);
      const content = response.content as string;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Infiltrator analysis failed:', error);
      throw error;
    }
  }

  async logAction(cvVersionId: string, action: string, message: string, metadata: any) {
    const { supabase } = await import('@/lib/supabase/client');
    await supabase.from('agent_logs').insert({
      cv_version_id: cvVersionId,
      agent_name: 'INFILTRATOR',
      action,
      message,
      metadata,
    });
  }
}
