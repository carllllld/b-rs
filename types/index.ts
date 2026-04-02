export interface Bar {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  priceLevel?: number;
  currentMatch?: string;
  crowdLevel?: 'low' | 'medium' | 'high';
  beerPrice?: number;
  showingMatchWithSound?: boolean;
  placeId?: string;
}

export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  time: string;
  status: 'scheduled' | 'live' | 'finished';
  score?: {
    home: number;
    away: number;
  };
  homeLogo?: string;
  awayLogo?: string;
}

export interface LiveReport {
  barId: string;
  showingMatch: boolean;
  withSound: boolean;
  timestamp: number;
}
