'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { toast } from 'react-hot-toast';
import { getStripe } from '@/lib/stripe/client';

const plans = [
  {
    name: 'Free',
    price: 0,
    priceId: null,
    credits: 3,
    features: [
      '3 CV optimizations',
      'Basic ATS analysis',
      'PDF export',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    credits: 50,
    popular: true,
    features: [
      '50 CV optimizations per month',
      'Advanced ATS analysis',
      'Auto-apply to jobs',
      'Priority support',
      'Analytics dashboard',
      'Custom templates',
    ],
  },
  {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE,
    credits: 999,
    features: [
      'Unlimited CV optimizations',
      'Advanced ATS analysis',
      'Auto-apply to jobs',
      'Dedicated support',
      'Analytics dashboard',
      'Custom templates',
      'API access',
      'Team collaboration',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, profile } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null | undefined, planName: string) => {
    if (!user) {
      router.push('/signup');
      return;
    }

    if (!priceId) {
      toast.error('This plan is not available for purchase');
      return;
    }

    setLoading(planName);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const stripe = await getStripe();
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start with 3 free optimizations. Upgrade anytime for more credits and advanced features.
        </p>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 ${
                plan.popular
                  ? 'bg-blue-600 ring-blue-600'
                  : 'bg-white ring-gray-200'
              }`}
            >
              <h3
                className={`text-lg font-semibold leading-8 ${
                  plan.popular ? 'text-white' : 'text-gray-900'
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`mt-4 text-sm leading-6 ${
                  plan.popular ? 'text-blue-100' : 'text-gray-600'
                }`}
              >
                {plan.credits} credits per month
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    plan.popular ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  ${plan.price}
                </span>
                <span
                  className={`text-sm font-semibold leading-6 ${
                    plan.popular ? 'text-blue-100' : 'text-gray-600'
                  }`}
                >
                  /month
                </span>
              </p>

              <button
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading === plan.name || (profile?.subscription_tier === plan.name.toLowerCase())}
                className={`mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
                  plan.popular
                    ? 'bg-white text-blue-600 hover:bg-blue-50 focus-visible:outline-white'
                    : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                }`}
              >
                {loading === plan.name
                  ? 'Loading...'
                  : profile?.subscription_tier === plan.name.toLowerCase()
                  ? 'Current Plan'
                  : plan.price === 0
                  ? 'Get Started'
                  : 'Subscribe'}
              </button>

              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 ${
                  plan.popular ? 'text-blue-100' : 'text-gray-600'
                }`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      className={`h-6 w-5 flex-none ${
                        plan.popular ? 'text-white' : 'text-blue-600'
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
