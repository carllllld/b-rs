'use client';

import { Match } from '@/types';

interface MatchSidebarProps {
  matches: Match[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
  onClearFilter: () => void;
}

export default function MatchSidebar({ matches, selectedMatch, onSelectMatch, onClearFilter }: MatchSidebarProps) {
  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled');

  return (
    <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4">
        {selectedMatch && (
          <button 
            onClick={onClearFilter}
            className="w-full mb-4 p-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-all"
          >
            ✕ Visa alla barer
          </button>
        )}

        {liveMatches.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Live nu</h2>
            </div>
            <div className="space-y-2 mb-6">
              {liveMatches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  isLive 
                  isSelected={selectedMatch?.id === match.id}
                  onClick={() => onSelectMatch(match)}
                />
              ))}
            </div>
          </>
        )}

        {upcomingMatches.length > 0 && (
          <>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-400">Senare ikväll</h2>
            <div className="space-y-2">
              {upcomingMatches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match}
                  isSelected={selectedMatch?.id === match.id}
                  onClick={() => onSelectMatch(match)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MatchCard({ 
  match, 
  isLive = false, 
  isSelected = false,
  onClick 
}: { 
  match: Match; 
  isLive?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl transition-all ${
        isSelected 
          ? 'bg-white/20 border border-white/30' 
          : 'bg-white/5 hover:bg-white/10 border border-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-gray-400">{match.league}</span>
        {isLive && (
          <span className="text-[10px] bg-red-500 px-2 py-0.5 rounded-full font-bold">
            LIVE
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{match.homeTeam}</span>
          {match.score && <span className="font-bold text-lg">{match.score.home}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{match.awayTeam}</span>
          {match.score && <span className="font-bold text-lg">{match.score.away}</span>}
        </div>
      </div>
      
      {!isLive && (
        <div className="mt-2 text-xs text-gray-500">
          {match.time}
        </div>
      )}
    </button>
  );
}
