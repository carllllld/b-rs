'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

interface WarRoomProps {
  sessionId: string;
  onClose: () => void;
}

interface AgentLog {
  id: string;
  agent_name: string;
  action: string;
  message: string;
  metadata: any;
  created_at: string;
}

export default function WarRoom({ sessionId, onClose }: WarRoomProps) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [cvVersion, setCvVersion] = useState<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLogs();
    fetchCVVersion();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('agent_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_logs',
          filter: `cv_version_id=eq.${sessionId}`,
        },
        (payload: any) => {
          setLogs((prev) => [...prev, payload.new as AgentLog]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('cv_version_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setLogs(data);
    }
  };

  const fetchCVVersion = async () => {
    const { data } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (data) {
      setCvVersion(data);
    }
  };

  const getAgentColor = (agentName: string) => {
    switch (agentName) {
      case 'INFILTRATOR':
        return 'text-cyber-red';
      case 'ARCHITECT':
        return 'text-cyber-blue';
      case 'AUDITOR':
        return 'text-cyber-purple';
      case 'GHOST_BROWSER':
        return 'text-cyber-green';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Terminal Log */}
      <div className="lg:col-span-2">
        <div className="bg-cyber-dark border border-cyber-blue/30 h-[600px] flex flex-col">
          <div className="border-b border-white/10 p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-cyber-blue">
              AGENT COMMUNICATION LOG
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-500">LIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <span className="text-gray-600">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
                <span className={`font-bold ${getAgentColor(log.agent_name)}`}>
                  [{log.agent_name}]
                </span>
                <span className="text-gray-400">{log.action}:</span>
                <span className="text-white">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Status Panel */}
      <div className="space-y-6">
        {/* CV Status */}
        <div className="bg-cyber-dark border border-cyber-blue/30 p-4">
          <h3 className="text-sm font-bold mb-4 text-cyber-blue">CV STATUS</h3>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-gray-500">ATS SCORE</span>
              <div className="mt-1">
                <div className="text-2xl font-bold text-cyber-green">
                  {cvVersion?.ats_score || 0}%
                </div>
                <div className="w-full bg-cyber-darker h-2 mt-2">
                  <div
                    className="bg-cyber-green h-full transition-all"
                    style={{ width: `${cvVersion?.ats_score || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-500">STATUS</span>
              <div className="mt-1 text-sm font-bold">
                {cvVersion?.status === 'verified' && (
                  <span className="text-cyber-green">✓ VERIFIED ACCESS</span>
                )}
                {cvVersion?.status === 'processing' && (
                  <span className="text-cyber-blue">⟳ PROCESSING</span>
                )}
                {cvVersion?.status === 'needs_review' && (
                  <span className="text-yellow-500">⚠ NEEDS REVIEW</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-500">VERSION</span>
              <div className="mt-1 text-sm">v{cvVersion?.version_number || 1}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-cyber-dark border border-cyber-blue/30 p-4">
          <h3 className="text-sm font-bold mb-4 text-cyber-blue">ACTIONS</h3>
          <div className="space-y-2">
            <button
              disabled={cvVersion?.status !== 'verified'}
              className="w-full bg-cyber-green text-black font-bold py-2 text-sm hover:bg-cyber-green/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              DOWNLOAD OPTIMIZED CV
            </button>
            <button
              disabled={cvVersion?.status !== 'verified'}
              className="w-full bg-cyber-blue text-black font-bold py-2 text-sm hover:bg-cyber-blue/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              AUTO-APPLY NOW
            </button>
            <button
              onClick={onClose}
              className="w-full bg-white/5 text-white font-bold py-2 text-sm hover:bg-white/10 transition-all"
            >
              NEW SESSION
            </button>
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-cyber-dark border border-cyber-blue/30 p-4">
          <h3 className="text-sm font-bold mb-4 text-cyber-blue">AGENT STATUS</h3>
          <div className="space-y-2 text-xs">
            {['INFILTRATOR', 'ARCHITECT', 'AUDITOR', 'GHOST_BROWSER'].map((agent) => {
              const agentLogs = logs.filter((l) => l.agent_name === agent);
              const isActive = agentLogs.length > 0;
              const lastAction = agentLogs[agentLogs.length - 1];

              return (
                <div key={agent} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-cyber-green' : 'bg-gray-600'
                      }`}
                    />
                    <span>{agent}</span>
                  </div>
                  <span className="text-[10px] text-gray-600">
                    {lastAction?.action || 'STANDBY'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
