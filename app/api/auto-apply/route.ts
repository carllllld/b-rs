import { NextRequest, NextResponse } from 'next/server';
import { BlackboardOrchestrator } from '@/lib/blackboard/orchestrator';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { cvVersionId, jobUrl } = await request.json();

    if (!cvVersionId || !jobUrl) {
      return NextResponse.json(
        { error: 'CV version ID and job URL are required' },
        { status: 400 }
      );
    }

    // Fetch CV data
    const { data: cvVersion } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('id', cvVersionId)
      .single();

    if (!cvVersion || cvVersion.status !== 'verified') {
      return NextResponse.json(
        { error: 'CV must be verified before auto-apply' },
        { status: 400 }
      );
    }

    const orchestrator = new BlackboardOrchestrator();

    // Start auto-apply process
    const result = await orchestrator.autoApply(
      cvVersionId,
      jobUrl,
      cvVersion // Pass CV data
    );

    return NextResponse.json({
      success: true,
      applicationId: result,
    });
  } catch (error: any) {
    console.error('Auto-apply error:', error);
    return NextResponse.json(
      { error: error.message || 'Auto-apply failed' },
      { status: 500 }
    );
  }
}
