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

  const getCrowdLevelText = (level?: string) => {
    switch (level) {
      case 'low': return '🟢 Lugnt';
      case 'medium': return '🟡 Halvfullt';
      case 'high': return '🔴 Fullsatt';
      default: return '⚪ Okänt';
    }
  };

  return (
    <div className="w-96 bg-dark-card border-l border-gray-800 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{bar.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm">📍 Adress</p>
            <p className="text-white">{bar.address}</p>
          </div>

          {bar.rating && (
            <div>
              <p className="text-gray-400 text-sm">⭐ Betyg</p>
              <p className="text-white">{bar.rating} / 5</p>
            </div>
          )}

          <div>
            <p className="text-gray-400 text-sm">👥 Hur fullt är det?</p>
            <p className="text-white text-lg">{getCrowdLevelText(bar.crowdLevel)}</p>
          </div>

          {bar.beerPrice && (
            <div>
              <p className="text-gray-400 text-sm">🍺 Pris stor stark</p>
              <p className="text-white text-xl font-bold">{bar.beerPrice} kr</p>
            </div>
          )}

          {bar.currentMatch && (
            <div className="bg-dark-bg rounded-lg p-4 border border-accent-green">
              <p className="text-gray-400 text-sm mb-1">⚽ Visar nu</p>
              <p className="text-accent-green font-bold text-lg">{bar.currentMatch}</p>
              {bar.showingMatchWithSound && (
                <p className="text-green-400 text-sm mt-2">
                  ✓ Bekräftat med ljud
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleLiveReport}
            disabled={reporting || reported}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              reported
                ? 'bg-green-600 text-white'
                : 'bg-accent-blue hover:bg-blue-600 text-white'
            } disabled:opacity-50`}
          >
            {reported ? '✓ Tack för din rapport!' : '📢 Rapportera Live'}
          </button>
          <p className="text-xs text-gray-500 text-center">
            Är du på plats? Bekräfta att de visar matchen med ljud
          </p>
        </div>
      </div>
    </div>
  );
}
