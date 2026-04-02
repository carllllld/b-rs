'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { ExternalLink, Calendar, Building, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ApplicationsPage() {
  const { user } = useUser();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    const { supabase } = await import('@/lib/supabase/client');
    const { data } = await supabase
      .from('job_applications')
      .select('*, cv_versions(*)')
      .eq('user_id', user?.id || '')
      .order('created_at', { ascending: false });

    if (data) {
      setApplications(data);
    }
    setLoading(false);
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-700';
      case 'interview':
        return 'bg-blue-100 text-blue-700';
      case 'applying':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'accepted':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    const { supabase } = await import('@/lib/supabase/client');
    await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', appId);

    fetchApplications();
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
          <p className="mt-1 text-gray-600">Track all your job applications in one place</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={applications.length} />
        <StatCard
          label="Submitted"
          value={applications.filter((a) => a.status === 'submitted').length}
        />
        <StatCard
          label="Interviews"
          value={applications.filter((a) => a.status === 'interview').length}
        />
        <StatCard
          label="Accepted"
          value={applications.filter((a) => a.status === 'accepted').length}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'submitted', 'interview', 'rejected', 'accepted'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Start by optimizing your CV for a job posting
          </p>
          <Link
            href="/dashboard/optimize"
            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Optimize CV
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.job_title || app.cv_versions?.job_title || 'Untitled Position'}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                    {app.company_name && (
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {app.company_name}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied {format(new Date(app.created_at), 'MMM d, yyyy')}
                    </div>
                    {app.auto_applied && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Auto-applied
                      </span>
                    )}
                  </div>

                  {app.notes && (
                    <p className="mt-2 text-sm text-gray-600">{app.notes}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {app.job_url && (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-600" />
                    </a>
                  )}
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="interview">Interview</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
