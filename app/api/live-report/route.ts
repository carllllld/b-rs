import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barId, showingMatch, withSound } = body;

    // Här skulle du spara rapporten i en databas
    // För nu loggar vi bara
    console.log('Live report received:', {
      barId,
      showingMatch,
      withSound,
      timestamp: new Date().toISOString(),
    });

    // Simulera att vi uppdaterar baren
    return NextResponse.json({
      success: true,
      message: 'Tack för din rapport!',
    });
  } catch (error) {
    console.error('Error processing live report:', error);
    return NextResponse.json(
      { error: 'Failed to process report' },
      { status: 500 }
    );
  }
}
