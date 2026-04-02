import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for AI processing

export async function POST(request: NextRequest) {
  try {
    const { cvContent, jobDescription, jobUrl, companyContext, userId } = await request.json();

    if (!cvContent || !jobDescription) {
      return NextResponse.json(
        { error: 'CV content and job description are required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User must be authenticated' },
        { status: 401 }
      );
    }

    // Check user credits
    const { supabase } = await import('@/lib/supabase/client');
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_remaining, subscription_tier')
      .eq('id', userId)
      .single();

    if (!profile || profile.credits_remaining <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // Lazy load orchestrator
    const { BlackboardOrchestrator } = await import('@/lib/blackboard/orchestrator');
    const orchestrator = new BlackboardOrchestrator();

    // Start async processing
    const result = await orchestrator.processApplication(
      userId,
      cvContent,
      jobDescription,
      jobUrl,
      companyContext
    );

    // Deduct credit
    await supabase
      .from('profiles')
      .update({ 
        credits_remaining: profile.credits_remaining - 1,
        total_applications: profile.total_applications + 1 
      })
      .eq('id', userId);

    // Track usage
    await supabase.from('usage_tracking').insert({
      user_id: userId,
      action_type: 'cv_optimization',
      credits_used: 1,
      metadata: { cv_version_id: result.cvVersionId },
    });

    return NextResponse.json({
      success: true,
      cvVersionId: result.cvVersionId,
      atsScore: result.auditResult.atsScore,
      status: result.auditResult.status,
      iterations: result.iterations,
    });
  } catch (error: any) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}
