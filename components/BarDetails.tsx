'use client';

import { useState } from 'react';
import { Bar } from '@/types';

interface BarDetailsProps {
  bar: Bar;
  onClose: () => void;
}

export default function BarDetails({ bar, onClose }: BarDetailsProps) {
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleLiveReport = async () => {
    setReporting(true);
    try {
      await fetch('/api/live-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId: bar.id,
          showingMatch: true,
          withSound: true,
        }),
      });
      setReported(true);
      setTimeout(() => setReported(false), 3000);
    } catch (error) {
      console.error('Error reporting:', error);
    } finally {
      setReporting(false);
    }
  };

  const getCrowdLevel = (level?: string) => {
    switch (level) {
      case 'low': return { emoji: '🟢', text: 'Lugnt', color: 'text-green-400' };
      case 'medium': return { emoji: '🟡', text: 'Halvfullt', color: 'text-yellow-400' };
      case 'high': return { emoji: '🔴', text: 'Packat', color: 'text-red-400' };
      default: return { emoji: '⚪', text: 'Okänt', color: 'text-gray-400' };
    }
  };

  const crowd = getCrowdLevel(bar.crowdLevel);

  return (
    <div className="bg-black/95 backdrop-blur-xl rounded-t-3xl md:rounded-3xl border-t md:border border-white/10 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{bar.name}</h2>
            <p className="text-sm text-gray-400">{bar.address}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>

        {bar.currentMatch && (
          <div className="mb-6 p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/30">
            <div className="text-xs uppercase tracking-wider text-green-400 mb-1">Visar nu</div>
            <div className="text-lg font-bold">{bar.currentMatch}</div>
            {bar.showingMatchWithSound && (
              <div className="text-xs text-green-400 mt-2">✓ Med ljud</div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Hur fullt</div>
            <div className={`text-lg font-bold ${crowd.color}`}>
              {crowd.emoji} {crowd.text}
            </div>
          </div>

          {bar.beerPrice && (
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Stor stark</div>
              <div className="text-2xl font-bold">{bar.beerPrice} kr</div>
            </div>
          )}

          {bar.rating && (
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Betyg</div>
              <div className="text-lg font-bold">⭐ {bar.rating}</div>
            </div>
          )}
        </div>

        <button
          onClick={handleLiveReport}
          disabled={reporting || reported}
          className={`w-full py-4 rounded-xl font-bold transition-all ${
            reported
              ? 'bg-green-500 text-white'
              : 'bg-white text-black hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          {reported ? '✓ Rapporterat!' : 'Är du här? Rapportera in'}
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Bekräfta att de visar matchen
        </p>
      </div>
    </div>
  );
}
