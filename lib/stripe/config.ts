import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 3,
    features: [
      '3 CV optimizations',
      'Basic ATS analysis',
      'PDF export',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    credits: 50,
    features: [
      '50 CV optimizations per month',
      'Advanced ATS analysis',
      'Auto-apply to jobs',
      'Priority support',
      'Analytics dashboard',
      'Custom templates',
    ],
  },
  enterprise: {
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
} as const;
