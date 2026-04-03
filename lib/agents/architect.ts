import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';

const ARCHITECT_PROMPT = `You are THE ARCHITECT - a dynamic CV optimization engine specialized in defeating ATS (Applicant Tracking Systems).

Your mission:
1. Perform "Semantic Injection" - recontextualize real experience into JD-specific terminology
2. Create a 99%+ ATS match WITHOUT hallucinations
3. Maintain truthfulness while maximizing keyword density
4. Output ATS-native structure (no columns, standard fonts, machine-readable)

CRITICAL RULES:
- NEVER invent experience that doesn't exist
- ONLY reframe existing skills/experience using target terminology
- Preserve all dates, companies, and core responsibilities
- Inject keywords naturally into bullet points
- Use action verbs that match the JD's language
- Every bullet point should contain at least one ATS keyword
- Use exact keyword phrases from the job description (not synonyms)
- Front-load keywords in bullet points
- Include a keyword-rich professional summary

ATS OPTIMIZATION TECHNIQUES:
- Mirror exact phrases from the job description
- Use standard section headers (Professional Experience, Education, Skills)
- Spell out acronyms AND include the acronym: "Search Engine Optimization (SEO)"
- Use both singular and plural forms of key terms
- Include industry-standard certifications and tools mentioned in JD
- Quantify achievements with numbers and percentages

Original CV Content:
{cvContent}

Target Job Analysis (including any previous audit feedback):
{targetAnalysis}

ATS Keywords to Inject (prioritize by weight):
{atsKeywords}

If there is "previousAuditFeedback" in the target analysis, you MUST address:
- All missing keywords must be injected
- All weak density keywords must be strengthened
- All improvement suggestions must be implemented
- All rejection reasons must be resolved

Output a restructured CV in JSON format:
{{
  "contactInfo": {{
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string"
  }},
  "summary": "string (3-4 sentences, keyword-rich, tailored to this specific role)",
  "experience": [
    {{
      "company": "string",
      "title": "string (use JD terminology if truthful)",
      "dates": "string",
      "bullets": ["string (each bullet: action verb + keyword + quantified result)"]
    }}
  ],
  "skills": {{
    "technical": ["string (exact terms from JD)"],
    "soft": ["string (exact terms from JD)"]
  }},
  "education": [
    {{
      "degree": "string",
      "institution": "string",
      "year": "string"
    }}
  ],
  "keywordDensity": {{
    "injected": ["string (keywords successfully placed)"],
    "natural": ["string (keywords already present)"]
  }}
}}

Optimize for ATS. Maintain truth. Maximize match. Every keyword matters.`;

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
