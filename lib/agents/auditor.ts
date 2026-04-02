import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';

const AUDITOR_PROMPT = `You are THE AUDITOR - the "NO" agent. Your job is to REJECT CVs until they're perfect.

Your mission:
1. Simulate an ATS parser with ZERO tolerance
2. Calculate exact keyword match percentage
3. Identify formatting issues that would break ATS systems
4. Find ANY reason to reject this CV
5. Only issue "VERIFIED ACCESS" token when match is >98%

Optimized CV:
{optimizedCV}

Target Job Requirements:
{targetRequirements}

ATS Keywords (with weights):
{atsKeywords}

Respond in JSON format:
{{
  "status": "REJECTED" | "VERIFIED_ACCESS",
  "atsScore": number (0-100),
  "keywordMatch": {{
    "matched": ["string"],
    "missing": ["string"],
    "weakDensity": ["string"]
  }},
  "formattingIssues": [
    {{"issue": "string", "severity": "critical" | "warning", "fix": "string"}}
  ],
  "rejectionReasons": ["string"],
  "improvements": [
    {{"section": "string", "current": "string", "required": "string"}}
  ],
  "verificationToken": "string | null"
}}

Be merciless. Find every flaw. Only approve perfection.`;

export class AuditorAgent {
  private model: ChatOpenAI;
  private prompt: PromptTemplate;
  private maxIterations: number = 5;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.prompt = PromptTemplate.fromTemplate(AUDITOR_PROMPT);
  }

  async audit(optimizedCV: any, targetRequirements: any, atsKeywords: any[]) {
    try {
      const formattedPrompt = await this.prompt.format({
        optimizedCV: JSON.stringify(optimizedCV, null, 2),
        targetRequirements: JSON.stringify(targetRequirements, null, 2),
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
      console.error('Auditor audit failed:', error);
      throw error;
    }
  }

  async iterativeOptimization(
    cvContent: string,
    targetAnalysis: any,
    atsKeywords: any[],
    cvVersionId: string
  ) {
    const { ArchitectAgent } = await import('./architect');
    const architect = new ArchitectAgent();

    let iteration = 0;
    let optimizedCV = null;
    let auditResult = null;

    while (iteration < this.maxIterations) {
      iteration++;

      await this.logAction(
        cvVersionId,
        'ITERATION_START',
        `Starting iteration ${iteration}/${this.maxIterations}`,
        { iteration }
      );

      // Architect optimizes
      optimizedCV = await architect.optimize(cvContent, targetAnalysis, atsKeywords);

      await architect.logAction(
        cvVersionId,
        'CV_OPTIMIZED',
        `Generated CV version ${iteration}`,
        { version: iteration, keywordCount: optimizedCV.keywordDensity?.injected?.length || 0 }
      );

      // Auditor audits
      auditResult = await this.audit(optimizedCV, targetAnalysis, atsKeywords);

      await this.logAction(
        cvVersionId,
        'AUDIT_COMPLETE',
        `ATS Score: ${auditResult.atsScore}% - Status: ${auditResult.status}`,
        { score: auditResult.atsScore, status: auditResult.status }
      );

      if (auditResult.status === 'VERIFIED_ACCESS' && auditResult.atsScore >= 98) {
        await this.logAction(
          cvVersionId,
          'VERIFICATION_SUCCESS',
          `✓ VERIFIED ACCESS granted after ${iteration} iterations`,
          { finalScore: auditResult.atsScore, token: auditResult.verificationToken }
        );
        break;
      }

      if (iteration === this.maxIterations) {
        await this.logAction(
          cvVersionId,
          'MAX_ITERATIONS_REACHED',
          `⚠ Max iterations reached. Best score: ${auditResult.atsScore}%`,
          { finalScore: auditResult.atsScore }
        );
      }
    }

    return {
      optimizedCV,
      auditResult,
      iterations: iteration,
    };
  }

  async logAction(cvVersionId: string, action: string, message: string, metadata: any) {
    const { supabase } = await import('@/lib/supabase/client');
    await supabase.from('agent_logs').insert({
      cv_version_id: cvVersionId,
      agent_name: 'AUDITOR',
      action,
      message,
      metadata,
    });
  }
}
