import { NextResponse } from 'next/server';
import { Bar } from '@/types';

// Mock data - ersätt med riktig Google Places API-integration
const mockBars: Bar[] = [
  {
    id: '1',
    name: 'O\'Learys Centralstation',
    address: 'Centralplan 15, Stockholm',
    latitude: 59.3301,
    longitude: 18.0586,
    rating: 4.2,
    priceLevel: 2,
    currentMatch: 'Premier League: Arsenal vs Chelsea',
    crowdLevel: 'high',
    beerPrice: 89,
    showingMatchWithSound: true,
  },
  {
    id: '2',
    name: 'Akkurat',
    address: 'Hornsgatan 18, Stockholm',
    latitude: 59.3176,
    longitude: 18.0614,
    rating: 4.5,
    priceLevel: 2,
    currentMatch: 'La Liga: Real Madrid vs Barcelona',
    crowdLevel: 'medium',
    beerPrice: 95,
    showingMatchWithSound: true,
  },
  {
    id: '3',
    name: 'The Liffey',
    address: 'Luntmakargatan 46, Stockholm',
    latitude: 59.3396,
    longitude: 18.0586,
    rating: 4.3,
    priceLevel: 2,
    crowdLevel: 'low',
    beerPrice: 85,
  },
  {
    id: '4',
    name: 'Bishops Arms Vasagatan',
    address: 'Vasagatan 22, Stockholm',
    latitude: 59.3326,
    longitude: 18.0575,
    rating: 4.1,
    priceLevel: 2,
    currentMatch: 'Champions League: Bayern vs PSG',
    crowdLevel: 'medium',
    beerPrice: 92,
  },
  {
    id: '5',
    name: 'Wirströms Pub',
    address: 'Stora Nygatan 13, Stockholm',
    latitude: 59.3251,
    longitude: 18.0711,
    rating: 4.4,
    priceLevel: 2,
    crowdLevel: 'low',
    beerPrice: 88,
  },
];

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    // Om API-nyckel finns och inte är placeholder, använd live-data
    if (apiKey && apiKey !== 'your_google_api_key_here') {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=59.3293,18.0686&radius=5000&type=bar&keyword=sports&key=${apiKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const liveBars: Bar[] = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            rating: place.rating,
            priceLevel: place.price_level,
            placeId: place.place_id,
          }));
          return NextResponse.json(liveBars);
        }
      } catch (apiError) {
        console.error('Google Places API error, falling back to mock data:', apiError);
      }
    }
    
    // Fallback till mock-data
    return NextResponse.json(mockBars);
  } catch (error) {
    console.error('Error fetching bars:', error);
    return NextResponse.json({ error: 'Failed to fetch bars' }, { status: 500 });
  }
}
