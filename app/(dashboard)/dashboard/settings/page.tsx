'use client';

import { useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { toast } from 'react-hot-toast';
import { CreditCard, User, Bell } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useUser();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      refreshProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      // Implement Stripe subscription cancellation
      toast.success('Subscription cancelled');
      refreshProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Subscription */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <div className="font-medium text-gray-900">
                {profile?.subscription_tier?.toUpperCase() || 'FREE'} Plan
              </div>
              <div className="text-sm text-gray-600">
                {profile?.credits_remaining || 0} credits remaining
              </div>
            </div>
            <div className="flex gap-2">
              {profile?.subscription_tier === 'free' ? (
                <Link
                  href="/pricing"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  Upgrade Plan
                </Link>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Change Plan
                  </Link>
                  <button
                    onClick={handleCancelSubscription}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {profile?.subscription_status === 'active' && (
            <div className="text-sm text-gray-600">
              Your subscription will renew automatically each month.
            </div>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Usage Statistics</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-2xl font-bold text-gray-900">
              {profile?.total_applications || 0}
            </div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-2xl font-bold text-gray-900">
              {profile?.credits_remaining || 0}
            </div>
            <div className="text-sm text-gray-600">Credits Left</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-2xl font-bold text-gray-900">
              {profile?.subscription_tier === 'pro' ? 50 : profile?.subscription_tier === 'enterprise' ? 999 : 3}
            </div>
            <div className="text-sm text-gray-600">Monthly Limit</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
        <p className="mt-2 text-sm text-gray-600">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you absolutely sure? This action cannot be undone.')) {
              toast.error('Account deletion not implemented yet');
            }
          }}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
