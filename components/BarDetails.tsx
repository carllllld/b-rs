'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bar } from '@/types';

interface BarDetailsProps {
  bar: Bar;
  onClose: () => void;
}

interface Comment {
  id: string;
  text: string;
  user: { username: string };
  createdAt: string;
}

interface Report {
  id: string;
  showingMatch: boolean;
  matchName: string | null;
  withSound: boolean;
  crowdLevel: string | null;
  beerPrice: number | null;
  user: { username: string };
  createdAt: string;
}

export default function BarDetails({ bar, onClose }: BarDetailsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showReportForm, setShowReportForm] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [newComment, setNewComment] = useState('');
  const [reportData, setReportData] = useState({
    showingMatch: true,
    matchName: bar.currentMatch || '',
    withSound: true,
    crowdLevel: 'medium',
    beerPrice: bar.beerPrice || 0,
  });

  useEffect(() => {
    fetchComments();
    fetchReports();
  }, [bar.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?barId=${bar.id}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/live-report?barId=${bar.id}`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleReport = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/live-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId: bar.id,
          barName: bar.name,
          ...reportData,
        }),
      });

      if (response.ok) {
        setShowReportForm(false);
        fetchReports();
      }
    } catch (error) {
      console.error('Error reporting:', error);
    }
  };

  const handleComment = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId: bar.id,
          text: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just nu';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m sedan`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h sedan`;
    return `${Math.floor(seconds / 86400)}d sedan`;
  };

  return (
    <div className="bg-black/95 backdrop-blur-xl border-t md:border border-white/10 overflow-hidden max-h-[80vh] flex flex-col">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{bar.name}</h2>
          <p className="text-xs text-gray-400">{bar.address}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {bar.currentMatch && (
          <div className="p-3 bg-white/5 border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Visar nu</div>
            <div className="font-bold">{bar.currentMatch}</div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 p-3">
            <div className="text-[10px] text-gray-400">Fullt</div>
            <div className="text-sm font-bold">{bar.crowdLevel || '?'}</div>
          </div>
          <div className="bg-white/5 p-3">
            <div className="text-[10px] text-gray-400">Öl</div>
            <div className="text-sm font-bold">{bar.beerPrice || '?'} kr</div>
          </div>
          <div className="bg-white/5 p-3">
            <div className="text-[10px] text-gray-400">Betyg</div>
            <div className="text-sm font-bold">{bar.rating || '?'}</div>
          </div>
        </div>

        {!showReportForm ? (
          <button
            onClick={() => session ? setShowReportForm(true) : router.push('/login')}
            className="w-full py-3 bg-white text-black font-bold hover:bg-gray-200 transition-all"
          >
            Rapportera in
          </button>
        ) : (
          <div className="space-y-3 bg-white/5 p-4">
            <div>
              <label className="text-xs text-gray-400">Match som visas</label>
              <input
                type="text"
                value={reportData.matchName}
                onChange={(e) => setReportData({ ...reportData, matchName: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-black/50 border border-white/10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Hur fullt</label>
              <select
                value={reportData.crowdLevel}
                onChange={(e) => setReportData({ ...reportData, crowdLevel: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-black/50 border border-white/10 text-sm"
              >
                <option value="low">Lugnt</option>
                <option value="medium">Halvfullt</option>
                <option value="high">Packat</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Pris stor stark (kr)</label>
              <input
                type="number"
                value={reportData.beerPrice}
                onChange={(e) => setReportData({ ...reportData, beerPrice: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-black/50 border border-white/10 text-sm"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reportData.withSound}
                onChange={(e) => setReportData({ ...reportData, withSound: e.target.checked })}
              />
              <span className="text-sm">Med ljud</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleReport}
                className="flex-1 py-2 bg-white text-black font-bold hover:bg-gray-200"
              >
                Skicka
              </button>
              <button
                onClick={() => setShowReportForm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10"
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

        {reports.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Senaste rapporter</h3>
            <div className="space-y-2">
              {reports.slice(0, 3).map((report) => (
                <div key={report.id} className="bg-white/5 p-2 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">{report.user.username}</span>
                    <span className="text-gray-500">{getTimeAgo(report.createdAt)}</span>
                  </div>
                  {report.matchName && <div>{report.matchName}</div>}
                  <div className="text-gray-400">
                    {report.crowdLevel} • {report.beerPrice}kr • {report.withSound ? 'Med ljud' : 'Utan ljud'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Kommentarer</h3>
          <div className="space-y-2 mb-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white/5 p-2 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-xs">{comment.user.username}</span>
                  <span className="text-[10px] text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                </div>
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              placeholder={session ? "Skriv en kommentar..." : "Logga in för att kommentera"}
              disabled={!session}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-sm disabled:opacity-50"
            />
            <button
              onClick={handleComment}
              disabled={!session || !newComment.trim()}
              className="px-4 py-2 bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-50 disabled:bg-white/20 disabled:text-white"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
