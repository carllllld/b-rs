import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const { cvVersionId, jobUrl } = await request.json();

    if (!cvVersionId || !jobUrl) {
      return NextResponse.json(
        { error: 'CV version ID and job URL are required' },
        { status: 400 }
      );
    }

    const { supabase } = await import('@/lib/supabase/client');
    
    // Fetch CV data
    const { data: cvVersion } = await supabase
      .from('cv_versions')
      .select('*, profiles(*)')
      .eq('id', cvVersionId)
      .single();

    if (!cvVersion || cvVersion.status !== 'verified') {
      return NextResponse.json(
        { error: 'CV must be verified before auto-apply' },
        { status: 400 }
      );
    }

    // Check if user has Pro or Enterprise plan
    if (cvVersion.profiles.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Auto-apply requires Pro or Enterprise plan' },
        { status: 403 }
      );
    }

    // Lazy load orchestrator
    const { BlackboardOrchestrator } = await import('@/lib/blackboard/orchestrator');
    const orchestrator = new BlackboardOrchestrator();

    // Start auto-apply process
    const result = await orchestrator.autoApply(
      cvVersionId,
      jobUrl,
      cvVersion.optimized_cv_data
    );

    return NextResponse.json({
      success: true,
      applicationId: result,
      message: 'Application submitted successfully',
    });
  } catch (error: any) {
    console.error('Auto-apply error:', error);
    return NextResponse.json(
      { error: error.message || 'Auto-apply failed' },
      { status: 500 }
    );
  }
}
