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
    const apiKey = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
    
    // Om API-nyckel finns och inte är placeholder, använd live-data
    if (apiKey && apiKey !== 'your_football_api_key_here') {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(
          `https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Europe/Stockholm`,
          {
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': 'v3.football.api-sports.io'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const liveMatches: Match[] = data.response.map((fixture: any) => ({
            id: fixture.fixture.id,
            homeTeam: fixture.teams.home.name,
            awayTeam: fixture.teams.away.name,
            league: fixture.league.name,
            time: new Date(fixture.fixture.date).toLocaleTimeString('sv-SE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            status: fixture.fixture.status.short === 'LIVE' ? 'live' : 
                    fixture.fixture.status.short === 'FT' ? 'finished' : 'scheduled',
            score: fixture.goals.home !== null ? {
              home: fixture.goals.home,
              away: fixture.goals.away
            } : undefined,
            homeLogo: fixture.teams.home.logo,
            awayLogo: fixture.teams.away.logo,
          }));
          return NextResponse.json(liveMatches);
        }
      } catch (apiError) {
        console.error('Football API error, falling back to mock data:', apiError);
      }
    }
    
    // Fallback till mock-data
    return NextResponse.json(mockMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
