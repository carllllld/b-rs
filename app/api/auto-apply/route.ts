import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { cvVersionId, jobUrl } = await request.json();

    if (!cvVersionId || !jobUrl) {
      return NextResponse.json(
        { error: 'CV version ID and job URL are required' },
        { status: 400 }
      );
    }

    // Mock response for now
    return NextResponse.json({
      success: true,
      applicationId: `app_${Date.now()}`,
      message: 'Auto-apply feature will be enabled after full deployment.',
    });
  } catch (error: any) {
    console.error('Auto-apply error:', error);
    return NextResponse.json(
      { error: error.message || 'Auto-apply failed' },
      { status: 500 }
    );
  }
}
