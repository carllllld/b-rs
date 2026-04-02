import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { cvContent, jobDescription, jobUrl, companyContext } = await request.json();

    if (!cvContent || !jobDescription) {
      return NextResponse.json(
        { error: 'CV content and job description are required' },
        { status: 400 }
      );
    }

    // Mock response for now - implement full processing later
    const mockCvVersionId = `cv_${Date.now()}`;

    return NextResponse.json({
      success: true,
      cvVersionId: mockCvVersionId,
      atsScore: 85,
      status: 'processing',
      message: 'Processing started. Full AI agents will be enabled after deployment.',
    });
  } catch (error: any) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}
