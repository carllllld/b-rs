'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { Plus, FileText, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();
  const [cvVersions, setCvVersions] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const { supabase } = await import('@/lib/supabase/client');
    
    const { data: cvs } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: apps } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (cvs) setCvVersions(cvs);
    if (apps) setApplications(apps);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="h-6 w-6 text-blue-600" />}
          label="Credits Remaining"
          value={profile?.credits_remaining || 0}
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          label="Total Applications"
          value={profile?.total_applications || 0}
        />
        <StatCard
          icon={<Clock className="h-6 w-6 text-purple-600" />}
          label="CV Versions"
          value={cvVersions.length}
        />
        <StatCard
          icon={<FileText className="h-6 w-6 text-orange-600" />}
          label="Subscription"
          value={profile?.subscription_tier?.toUpperCase() || 'FREE'}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/optimize"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Optimize New CV</div>
              <div className="text-sm text-gray-500">Start a new optimization</div>
            </div>
          </Link>
          <Link
            href="/dashboard/applications"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-blue-600 hover:bg-blue-50"
          >
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">View Applications</div>
              <div className="text-sm text-gray-500">Track your progress</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent CV Versions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent CV Optimizations</h2>
        {cvVersions.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No CV versions yet. Create your first one!</p>
        ) : (
          <div className="mt-4 space-y-3">
            {cvVersions.map((cv) => (
              <div
                key={cv.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {cv.job_title || 'Untitled Position'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cv.company_name || 'Unknown Company'} • ATS Score: {cv.ats_score}%
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      cv.status === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : cv.status === 'processing'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cv.status}
                  </span>
                  <Link
                    href={`/dashboard/cv/${cv.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
