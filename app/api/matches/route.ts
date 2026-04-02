import { NextResponse } from 'next/server';
import { Match } from '@/types';

// Mock data - ersätt med riktig API-Football integration
const mockMatches: Match[] = [
  {
    id: 1,
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    league: 'Premier League',
    time: '20:00',
    status: 'live',
    score: { home: 2, away: 1 },
  },
  {
    id: 2,
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    league: 'La Liga',
    time: '21:00',
    status: 'live',
    score: { home: 1, away: 1 },
  },
  {
    id: 3,
    homeTeam: 'Bayern München',
    awayTeam: 'PSG',
    league: 'Champions League',
    time: '21:00',
    status: 'live',
    score: { home: 3, away: 2 },
  },
  {
    id: 4,
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    league: 'Premier League',
    time: '22:30',
    status: 'scheduled',
  },
  {
    id: 5,
    homeTeam: 'Juventus',
    awayTeam: 'Inter',
    league: 'Serie A',
    time: '22:45',
    status: 'scheduled',
  },
];

export async function GET() {
  try {
    // Här skulle du integrera med API-Football
    // const apiKey = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
    // const today = new Date().toISOString().split('T')[0];
    // const response = await fetch(
    //   `https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Europe/Stockholm`,
    //   {
    //     headers: {
    //       'x-rapidapi-key': apiKey,
    //       'x-rapidapi-host': 'v3.football.api-sports.io'
    //     }
    //   }
    // );
    
    return NextResponse.json(mockMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
