'use client';

import { useState, useEffect } from 'react';
import Map from '@/components/Map';
import MatchSidebar from '@/components/MatchSidebar';
import BarDetails from '@/components/BarDetails';
import { Bar, Match } from '@/types';

export default function Home() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBars();
    fetchMatches();
  }, []);

  const fetchBars = async () => {
    try {
      const response = await fetch('/api/bars');
      const data = await response.json();
      setBars(data);
    } catch (error) {
      console.error('Error fetching bars:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  return (
    <main className="h-screen flex flex-col">
      <header className="bg-dark-card border-b border-gray-800 p-4">
        <h1 className="text-2xl font-bold text-accent-green">
          ⚽ Stockholm Sports Bars
        </h1>
        <p className="text-gray-400 text-sm">Hitta din sportbar för kvällens matcher</p>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <MatchSidebar matches={matches} />
        
        <div className="flex-1 relative">
          <Map 
            bars={bars} 
            selectedBar={selectedBar}
            onSelectBar={setSelectedBar}
          />
        </div>

        {selectedBar && (
          <BarDetails 
            bar={selectedBar} 
            onClose={() => setSelectedBar(null)}
          />
        )}
      </div>
    </main>
  );
}
