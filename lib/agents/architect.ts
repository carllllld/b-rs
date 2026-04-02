import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';

const ARCHITECT_PROMPT = `You are THE ARCHITECT - a dynamic CV optimization engine.

Your mission:
1. Perform "Semantic Injection" - recontextualize real experience into JD-specific terminology
2. Create a 99% ATS match WITHOUT hallucinations
3. Maintain truthfulness while maximizing keyword density
4. Output ATS-native structure (no columns, standard fonts, machine-readable)

CRITICAL RULES:
- NEVER invent experience that doesn't exist
- ONLY reframe existing skills/experience using target terminology
- Preserve all dates, companies, and core responsibilities
- Inject keywords naturally into bullet points
- Use action verbs that match the JD's language

Original CV Content:
{cvContent}

Target Job Analysis:
{targetAnalysis}

ATS Keywords to Inject:
{atsKeywords}

Output a restructured CV in JSON format:
{{
  "contactInfo": {{
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string"
  }},
  "summary": "string (2-3 sentences, keyword-rich)",
  "experience": [
    {{
      "company": "string",
      "title": "string",
      "dates": "string",
      "bullets": ["string (inject keywords naturally)"]
    }}
  ],
  "skills": {{
    "technical": ["string"],
    "soft": ["string"]
  }},
  "education": [
    {{
      "degree": "string",
      "institution": "string",
      "year": "string"
    }}
  ],
  "keywordDensity": {{
    "injected": ["string"],
    "natural": ["string"]
  }}
}}

Optimize for ATS. Maintain truth. Maximize match.`;

export class ArchitectAgent {
  private model: ChatOpenAI;
  private prompt: PromptTemplate;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.4,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.prompt = PromptTemplate.fromTemplate(ARCHITECT_PROMPT);
  }

  async optimize(cvContent: string, targetAnalysis: any, atsKeywords: any[]) {
    try {
      const formattedPrompt = await this.prompt.format({
        cvContent,
        targetAnalysis: JSON.stringify(targetAnalysis, null, 2),
        atsKeywords: JSON.stringify(atsKeywords, null, 2),
      });

      const response = await this.model.invoke(formattedPrompt);
      const content = response.content as string;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Architect optimization failed:', error);
      throw error;
    }
  }

  async logAction(cvVersionId: string, action: string, message: string, metadata: any) {
    const { supabase } = await import('@/lib/supabase/client');
    await supabase.from('agent_logs').insert({
      cv_version_id: cvVersionId,
      agent_name: 'ARCHITECT',
      action,
      message,
      metadata,
    });
  }
}
