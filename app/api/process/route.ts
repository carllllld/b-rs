import { NextRequest, NextResponse } from 'next/server';
import { BlackboardOrchestrator } from '@/lib/blackboard/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const { cvContent, jobDescription, jobUrl, companyContext } = await request.json();

    if (!cvContent || !jobDescription) {
      return NextResponse.json(
        { error: 'CV content and job description are required' },
        { status: 400 }
      );
    }

    // For demo purposes, using a mock user ID
    // In production, get this from authentication
    const userId = 'demo-user-id';

    const orchestrator = new BlackboardOrchestrator();

    // Start async processing
    const result = await orchestrator.processApplication(
      userId,
      cvContent,
      jobDescription,
      jobUrl,
      companyContext
    );

    return NextResponse.json({
      success: true,
      cvVersionId: result.cvVersionId,
      atsScore: result.auditResult.atsScore,
      status: result.auditResult.status,
    });
  } catch (error: any) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}
