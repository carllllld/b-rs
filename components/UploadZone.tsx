'use client';

import { useState } from 'react';

interface UploadZoneProps {
  onSessionStart: (sessionId: string) => void;
}

export default function UploadZone({ onSessionStart }: UploadZoneProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [companyContext, setCompanyContext] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!cvFile || !jobDescription) {
      alert('Please upload CV and provide job description');
      return;
    }

    setLoading(true);

    try {
      // Read CV file
      const cvText = await cvFile.text();

      // Call API to start processing
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvContent: cvText,
          jobDescription,
          jobUrl,
          companyContext,
        }),
      });

      const data = await response.json();

      if (data.cvVersionId) {
        onSessionStart(data.cvVersionId);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start processing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CV Upload */}
      <div className="bg-cyber-dark border border-cyber-blue/30 p-6">
        <label className="block text-sm font-bold mb-3 text-cyber-blue">
          01 // UPLOAD CV
        </label>
        <input
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          className="w-full bg-cyber-darker border border-white/10 p-3 text-sm"
        />
        {cvFile && (
          <p className="text-xs text-cyber-green mt-2">✓ {cvFile.name}</p>
        )}
      </div>

      {/* Job Description */}
      <div className="bg-cyber-dark border border-cyber-blue/30 p-6">
        <label className="block text-sm font-bold mb-3 text-cyber-blue">
          02 // JOB DESCRIPTION
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          className="w-full bg-cyber-darker border border-white/10 p-3 text-sm h-48 resize-none"
        />
      </div>

      {/* Job URL */}
      <div className="bg-cyber-dark border border-cyber-blue/30 p-6">
        <label className="block text-sm font-bold mb-3 text-cyber-blue">
          03 // APPLICATION URL (Optional)
        </label>
        <input
          type="url"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          placeholder="https://company.com/careers/job-id"
          className="w-full bg-cyber-darker border border-white/10 p-3 text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          For auto-apply feature (Workday, Greenhouse, etc.)
        </p>
      </div>

      {/* Company Context */}
      <div className="bg-cyber-dark border border-cyber-blue/30 p-6">
        <label className="block text-sm font-bold mb-3 text-cyber-blue">
          04 // COMPANY INTEL (Optional)
        </label>
        <textarea
          value={companyContext}
          onChange={(e) => setCompanyContext(e.target.value)}
          placeholder="Any additional context about the company culture, values, or specific requirements..."
          className="w-full bg-cyber-darker border border-white/10 p-3 text-sm h-24 resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !cvFile || !jobDescription}
        className="w-full bg-cyber-blue text-black font-bold py-4 hover:bg-cyber-blue/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'INITIALIZING AGENTS...' : 'DEPLOY AGENTS'}
      </button>
    </div>
  );
}
