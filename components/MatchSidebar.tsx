'use client';

import { Match } from '@/types';

interface MatchSidebarProps {
  matches: Match[];
}

export default function MatchSidebar({ matches }: MatchSidebarProps) {
  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled');

  return (
    <div className="w-80 bg-dark-card border-r border-gray-800 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-accent-green">
          🔴 Live Matcher
        </h2>
        
        {liveMatches.length === 0 ? (
          <p className="text-gray-500 text-sm mb-6">Inga live-matcher just nu</p>
        ) : (
          <div className="space-y-3 mb-6">
            {liveMatches.map(match => (
              <MatchCard key={match.id} match={match} isLive />
            ))}
          </div>
        )}

        <h2 className="text-xl font-bold mb-4 mt-6">📅 Kommande Matcher</h2>
        <div className="space-y-3">
          {upcomingMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, isLive = false }: { match: Match; isLive?: boolean }) {
  return (
    <div className={`bg-dark-bg rounded-lg p-3 border ${
      isLive ? 'border-red-500' : 'border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{match.league}</span>
        {isLive && (
          <span className="text-xs bg-red-500 px-2 py-1 rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{match.homeTeam}</span>
          {match.score && <span className="font-bold">{match.score.home}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">{match.awayTeam}</span>
          {match.score && <span className="font-bold">{match.score.away}</span>}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        {isLive ? 'Pågår nu' : `Startar ${match.time}`}
      </div>
    </div>
  );
}
