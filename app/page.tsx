'use client';

import { useState } from 'react';
import WarRoom from '@/components/WarRoom';
import UploadZone from '@/components/UploadZone';

export default function Home() {
  const [activeSession, setActiveSession] = useState<string | null>(null);

  return (
    <main className="min-h-screen cyber-grid">
      {/* Header */}
      <header className="border-b border-cyber-blue/30 bg-cyber-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold terminal-text text-cyber-blue">
                APPLICANT-OS
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Multi-Agent Autonomous Application System
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">ALL AGENTS ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {!activeSession ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 terminal-text">
                INITIATE <span className="text-cyber-blue">INFILTRATION</span>
              </h2>
              <p className="text-gray-400">
                Upload your CV and target job description. The agents will handle the rest.
              </p>
            </div>

            <UploadZone onSessionStart={setActiveSession} />

            {/* Agent Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <AgentCard
                name="INFILTRATOR"
                status="STANDBY"
                color="cyber-red"
                description="Adversarial Analyst"
              />
              <AgentCard
                name="ARCHITECT"
                status="STANDBY"
                color="cyber-blue"
                description="CV Optimizer"
              />
              <AgentCard
                name="AUDITOR"
                status="STANDBY"
                color="cyber-purple"
                description="Quality Control"
              />
              <AgentCard
                name="GHOST"
                status="STANDBY"
                color="cyber-green"
                description="Auto-Apply Bot"
              />
            </div>
          </div>
        ) : (
          <WarRoom sessionId={activeSession} onClose={() => setActiveSession(null)} />
        )}
      </div>
    </main>
  );
}

function AgentCard({
  name,
  status,
  color,
  description,
}: {
  name: string;
  status: string;
  color: string;
  description: string;
}) {
  return (
    <div className="bg-cyber-dark border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 bg-${color} rounded-full`} />
        <span className="text-xs font-bold">{name}</span>
      </div>
      <p className="text-[10px] text-gray-500 mb-2">{description}</p>
      <span className="text-[10px] text-gray-600">{status}</span>
    </div>
  );
}
