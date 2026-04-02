'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, ExternalLink, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUser } from '@/lib/hooks/useUser';

interface AgentLog {
  id: string;
  agent_name: string;
  action: string;
  message: string;
  log_level: string;
  created_at: string;
}

export default function CVResultPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [cvVersion, setCvVersion] = useState<any>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoApplying, setAutoApplying] = useState(false);

  useEffect(() => {
    if (user && params.id) {
      fetchCVVersion();
      fetchLogs();
      subscribeToLogs();
    }
  }, [user, params.id]);

  const fetchCVVersion = async () => {
    const { supabase } = await import('@/lib/supabase/client');
    const { data, error } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      toast.error('Failed to load CV version');
      router.push('/dashboard');
      return;
    }

    setCvVersion(data);
    setLoading(false);
  };

  const fetchLogs = async () => {
    const { supabase } = await import('@/lib/supabase/client');
    const { data } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('cv_version_id', params.id)
      .order('created_at', { ascending: true });

    if (data) {
      setLogs(data);
    }
  };

  const subscribeToLogs = async () => {
    const { supabase } = await import('@/lib/supabase/client');
    const subscription = supabase
      .channel('cv_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_logs',
          filter: `cv_version_id=eq.${params.id}`,
        },
        (payload: any) => {
          setLogs((prev) => [...prev, payload.new]);
          // Refresh CV version when status changes
          if (payload.new.action === 'COMPLETE') {
            fetchCVVersion();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleDownload = () => {
    if (cvVersion?.optimized_cv_url) {
      window.open(cvVersion.optimized_cv_url, '_blank');
    } else {
      toast.error('PDF not ready yet');
    }
  };

  const handleAutoApply = async () => {
    if (!cvVersion?.job_url) {
      toast.error('No job URL provided');
      return;
    }

    if (cvVersion.status !== 'verified') {
      toast.error('CV must be verified before auto-apply');
      return;
    }

    setAutoApplying(true);

    try {
      const response = await fetch('/api/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvVersionId: cvVersion.id,
          jobUrl: cvVersion.job_url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Auto-apply failed');
      }

      toast.success('Application submitted successfully!');
      router.push('/dashboard/applications');
    } catch (error: any) {
      toast.error(error.message || 'Auto-apply failed');
    } finally {
      setAutoApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!cvVersion) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CV Optimization Results</h1>
          <p className="mt-1 text-gray-600">
            {cvVersion.job_title || 'Position'} at {cvVersion.company_name || 'Company'}
          </p>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusColor(cvVersion.status)}`}>
          {cvVersion.status.toUpperCase()}
        </span>
      </div>

      {/* ATS Score */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">ATS Compatibility Score</h2>
            <p className="text-sm text-gray-600">
              Optimized through {cvVersion.iterations_count} iterations
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-blue-600">{cvVersion.ats_score}%</div>
            {cvVersion.ats_score >= 98 && (
              <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Verified Access
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${
                cvVersion.ats_score >= 98
                  ? 'bg-green-500'
                  : cvVersion.ats_score >= 80
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${cvVersion.ats_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={handleDownload}
          disabled={!cvVersion.optimized_cv_url}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
        >
          <Download className="h-5 w-5" />
          Download Optimized CV
        </button>

        {cvVersion.job_url && (
          <button
            onClick={handleAutoApply}
            disabled={autoApplying || cvVersion.status !== 'verified'}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {autoApplying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Auto-Apply to Job
              </>
            )}
          </button>
        )}
      </div>

      {/* Analysis Results */}
      {cvVersion.infiltrator_analysis && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Job Analysis</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Key ATS Keywords</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {cvVersion.infiltrator_analysis.atsKeywords?.slice(0, 10).map((kw: any, i: number) => (
                  <span
                    key={i}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {kw.keyword} ({kw.weight})
                  </span>
                ))}
              </div>
            </div>

            {cvVersion.infiltrator_analysis.rejectionReasons?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">Potential Rejection Triggers</h3>
                <ul className="mt-2 space-y-2">
                  {cvVersion.infiltrator_analysis.rejectionReasons.map((reason: any, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                      <div>
                        <span className="font-medium">{reason.reason}</span>
                        <span className="text-gray-600"> - {reason.mitigation}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent Logs */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Processing Log</h2>
        <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 text-sm">
              <span className="text-gray-500">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
              <span className="font-medium text-gray-700">[{log.agent_name}]</span>
              <span className={getLogLevelColor(log.log_level)}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
