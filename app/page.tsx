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
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

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

  const filteredBars = selectedMatch 
    ? bars.filter(bar => bar.currentMatch?.includes(selectedMatch.homeTeam) || bar.currentMatch?.includes(selectedMatch.awayTeam))
    : bars;

  return (
    <main className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* Minimal header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">MATCHKVÄLL</h1>
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-all"
          >
            {showSidebar ? '✕' : `${matches.filter(m => m.status === 'live').length} LIVE`}
          </button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Map 
          bars={filteredBars} 
          selectedBar={selectedBar}
          onSelectBar={setSelectedBar}
        />

        {/* Floating match sidebar */}
        {showSidebar && (
          <div className="absolute top-20 left-4 w-80 max-h-[calc(100vh-120px)] overflow-y-auto">
            <MatchSidebar 
              matches={matches} 
              selectedMatch={selectedMatch}
              onSelectMatch={(match) => {
                setSelectedMatch(match);
                setSelectedBar(null);
              }}
              onClearFilter={() => setSelectedMatch(null)}
            />
          </div>
        )}

        {/* Bar details popup */}
        {selectedBar && (
          <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto md:w-96">
            <BarDetails 
              bar={selectedBar} 
              onClose={() => setSelectedBar(null)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
