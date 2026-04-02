'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import Link from 'next/link';
import { Home, FileText, CreditCard, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
    router.refresh();
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            APPLICANT-OS
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          <NavLink href="/dashboard" icon={<Home className="h-5 w-5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/dashboard/optimize" icon={<FileText className="h-5 w-5" />}>
            Optimize CV
          </NavLink>
          <NavLink href="/dashboard/applications" icon={<FileText className="h-5 w-5" />}>
            Applications
          </NavLink>
          <NavLink href="/pricing" icon={<CreditCard className="h-5 w-5" />}>
            Upgrade
          </NavLink>
          <NavLink href="/dashboard/settings" icon={<Settings className="h-5 w-5" />}>
            Settings
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-gray-200 p-4">
          <div className="mb-3 rounded-lg bg-blue-50 p-3">
            <div className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</div>
            <div className="text-xs text-gray-500">{profile?.email}</div>
            <div className="mt-2 text-xs font-medium text-blue-600">
              {profile?.credits_remaining} credits remaining
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      {icon}
      {children}
    </Link>
  );
}
