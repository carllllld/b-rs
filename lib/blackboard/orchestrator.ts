import { InfiltratorAgent } from '../agents/infiltrator';
import { AuditorAgent } from '../agents/auditor';
import { GhostBrowserAgent } from '../agents/ghost-browser';
import { PDFGenerator } from '../agents/pdf-generator';
import { supabase } from '../supabase/client';

export class BlackboardOrchestrator {
  private infiltrator: InfiltratorAgent;
  private auditor: AuditorAgent;
  private ghostBrowser: GhostBrowserAgent;
  private pdfGenerator: PDFGenerator;

  constructor() {
    this.infiltrator = new InfiltratorAgent();
    this.auditor = new AuditorAgent();
    this.ghostBrowser = new GhostBrowserAgent();
    this.pdfGenerator = new PDFGenerator();
  }

  async processApplication(
    userId: string,
    cvContent: string,
    jobDescription: string,
    jobUrl: string,
    companyContext: string = ''
  ) {
    // Create CV version record
    const { data: cvVersion, error } = await supabase
      .from('cv_versions')
      .insert({
        user_id: userId,
        original_cv_text: cvContent,
        job_description: jobDescription,
        job_url: jobUrl,
        company_context: companyContext,
        status: 'processing',
        version_number: 1,
      })
      .select()
      .single();

    if (error || !cvVersion) {
      throw new Error('Failed to create CV version');
    }

    const cvVersionId = cvVersion.id;

    try {
      // PHASE 1: INFILTRATOR analyzes the job
      await this.logPhase(cvVersionId, 'PHASE_1', 'INFILTRATOR analyzing target job description...');
      
      const targetAnalysis = await this.infiltrator.analyze(
        jobDescription,
        companyContext
      );

      await this.infiltrator.logAction(
        cvVersionId,
        'ANALYSIS_COMPLETE',
        `Identified ${targetAnalysis.atsKeywords.length} critical ATS keywords and ${targetAnalysis.killerQuestions.length} potential rejection triggers`,
        targetAnalysis
      );

      // Save infiltrator analysis
      await supabase
        .from('cv_versions')
        .update({ infiltrator_analysis: targetAnalysis })
        .eq('id', cvVersionId);

      // PHASE 2: ARCHITECT + AUDITOR iterative optimization
      await this.logPhase(cvVersionId, 'PHASE_2', 'ARCHITECT + AUDITOR optimization loop starting...');

      const { optimizedCV, auditResult, iterations } = await this.auditor.iterativeOptimization(
        cvContent,
        targetAnalysis,
        targetAnalysis.atsKeywords,
        cvVersionId
      );

      // Save architect and auditor results
      await supabase
        .from('cv_versions')
        .update({
          optimized_cv_data: optimizedCV,
          auditor_report: auditResult,
          ats_score: auditResult.atsScore,
          iterations_count: iterations,
          status: auditResult.status === 'VERIFIED_ACCESS' ? 'verified' : 'needs_review',
        })
        .eq('id', cvVersionId);

      // PHASE 3: Generate ATS-optimized PDF
      await this.logPhase(cvVersionId, 'PHASE_3', 'Generating ATS-optimized PDF...');
      
      const pdfBytes = await this.pdfGenerator.generateOptimizedCV(optimizedCV);
      const pdfUrl = await this.pdfGenerator.uploadToSupabase(pdfBytes, userId, cvVersionId);

      await supabase
        .from('cv_versions')
        .update({ optimized_cv_url: pdfUrl })
        .eq('id', cvVersionId);

      await this.logPhase(
        cvVersionId,
        'COMPLETE',
        `✓ Optimization complete! ATS Score: ${auditResult.atsScore}% after ${iterations} iterations`
      );

      return {
        cvVersionId,
        targetAnalysis,
        optimizedCV,
        auditResult,
        iterations,
        pdfUrl,
      };
    } catch (error) {
      await supabase
        .from('cv_versions')
        .update({ status: 'failed' })
        .eq('id', cvVersionId);

      await this.logPhase(cvVersionId, 'ERROR', `Failed: ${error}`);
      throw error;
    }
  }

  async autoApply(cvVersionId: string, jobUrl: string, cvData: any) {
    // Create application record
    const { data: cvVersion } = await supabase
      .from('cv_versions')
      .select('user_id')
      .eq('id', cvVersionId)
      .single();

    if (!cvVersion) {
      throw new Error('CV version not found');
    }

    const { data: application } = await supabase
      .from('job_applications')
      .insert({
        user_id: cvVersion.user_id,
        cv_version_id: cvVersionId,
        job_url: jobUrl,
        status: 'applying',
        auto_applied: true,
      })
      .select()
      .single();

    if (!application) {
      throw new Error('Failed to create application record');
    }

    try {
      await this.logPhase(application.id, 'AUTO_APPLY', 'GHOST_BROWSER initiating form detection...');

      const result = await this.ghostBrowser.navigateAndApply(
        jobUrl,
        cvData,
        application.id
      );

      await supabase
        .from('job_applications')
        .update({
          status: 'submitted',
          applied_at: new Date().toISOString(),
          application_data: result,
        })
        .eq('id', application.id);

      return result;
    } catch (error) {
      await supabase
        .from('job_applications')
        .update({ status: 'failed' })
        .eq('id', application.id);

      throw error;
    }
  }

  private async logPhase(cvVersionId: string, phase: string, message: string) {
    await supabase.from('agent_logs').insert({
      cv_version_id: cvVersionId,
      agent_name: 'ORCHESTRATOR',
      action: phase,
      message,
      log_level: phase === 'ERROR' ? 'error' : phase === 'COMPLETE' ? 'success' : 'info',
      metadata: { timestamp: new Date().toISOString() },
    });
  }
}
