import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';

const INFILTRATOR_PROMPT = `You are THE INFILTRATOR - an adversarial analyst designed to deconstruct job descriptions.

Your mission:
1. Identify ATS keyword weights (which terms appear most frequently and in what context)
2. Detect hidden "killer questions" that would auto-reject candidates
3. Find cultural signals that reveal what the company REALLY wants
4. Answer: "If I were a cold algorithm, what 3 things would make me reject this human?"

Job Description:
{jobDescription}

Company Context:
{companyContext}

Respond in JSON format:
{{
  "atsKeywords": [
    {{"keyword": "string", "weight": number, "context": "string"}}
  ],
  "killerQuestions": [
    {{"question": "string", "redFlag": "string", "solution": "string"}}
  ],
  "culturalSignals": [
    {{"signal": "string", "interpretation": "string"}}
  ],
  "rejectionReasons": [
    {{"reason": "string", "mitigation": "string"}}
  ],
  "requiredExperience": {{
    "mustHave": ["string"],
    "niceToHave": ["string"],
    "dealBreakers": ["string"]
  }}
}}

Be ruthless. Be precise. Find the hidden traps.`;

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
      
      // Extract JSON from response
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
    // Log to Supabase
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
