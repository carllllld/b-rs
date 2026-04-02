# Complete Setup Guide for APPLICANT-OS

This guide will walk you through setting up APPLICANT-OS from scratch to production-ready.

## Step 1: Initial Setup (5 minutes)

### 1.1 Clone and Install

```bash
git clone <your-repo-url>
cd applicant-os
npm install
```

### 1.2 Copy Environment File

```bash
cp .env.local.example .env.local
```

## Step 2: Supabase Setup (10 minutes)

### 2.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Name: `applicant-os`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 2.2 Run Database Schema

1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy entire contents of `lib/supabase/schema-complete.sql`
4. Paste and click "Run"
5. You should see "Success. No rows returned"

### 2.3 Create Storage Bucket

1. Go to "Storage" in sidebar
2. Click "New Bucket"
3. Name: `cv-files`
4. Public bucket: YES
5. Click "Create bucket"

### 2.4 Get API Keys

1. Go to "Settings" → "API"
2. Copy these values to `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: OpenAI Setup (5 minutes)

### 3.1 Get API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to "API Keys"
4. Click "Create new secret key"
5. Copy key to `.env.local` → `OPENAI_API_KEY`

### 3.2 Add Credits

1. Go to "Billing"
2. Add payment method
3. Add at least $10 credit
4. Set usage limits (recommended: $50/month)

**Cost estimate**: ~$0.03-0.05 per CV optimization

## Step 4: Stripe Setup (15 minutes)

### 4.1 Create Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for account
3. Complete business information

### 4.2 Create Products

1. Go to "Products" → "Add Product"

**Pro Plan:**
- Name: `Pro Plan`
- Description: `50 CV optimizations per month`
- Pricing: `$29.00 USD` / `Recurring` / `Monthly`
- Click "Save product"
- Copy the Price ID (starts with `price_`) → `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO`

**Enterprise Plan:**
- Name: `Enterprise Plan`
- Description: `Unlimited CV optimizations`
- Pricing: `$99.00 USD` / `Recurring` / `Monthly`
- Click "Save product"
- Copy the Price ID → `NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE`

### 4.3 Get API Keys

1. Go to "Developers" → "API keys"
2. Copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### 4.4 Set Up Webhook (After Deployment)

1. Go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

## Step 5: Generate Secrets (2 minutes)

### 5.1 NEXTAUTH_SECRET

Run this command:

```bash
openssl rand -base64 32
```

Copy output to `.env.local` → `NEXTAUTH_SECRET`

## Step 6: Test Locally (5 minutes)

### 6.1 Start Development Server

```bash
npm run dev
```

### 6.2 Test Features

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" and create account
3. Verify email in Supabase (Auth → Users)
4. Log in
5. Go to Dashboard
6. Try "Optimize CV" with sample data

### 6.3 Test Stripe (Optional)

1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC
4. Any ZIP code

## Step 7: Deploy to Production (10 minutes)

### 7.1 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Follow prompts:
- Set up and deploy: Yes
- Which scope: Your account
- Link to existing project: No
- Project name: applicant-os
- Directory: ./
- Override settings: No

### 7.2 Add Environment Variables

In Vercel dashboard:
1. Go to project → "Settings" → "Environment Variables"
2. Add ALL variables from `.env.local`
3. Make sure to use PRODUCTION values for:
   - `NEXT_PUBLIC_APP_URL` → Your Vercel URL
   - `NEXTAUTH_URL` → Your Vercel URL
   - Stripe keys → Use LIVE keys (not test)

### 7.3 Update Stripe Webhook

1. Go back to Stripe → Webhooks
2. Update endpoint URL to your Vercel URL
3. Copy new signing secret to Vercel env vars

### 7.4 Redeploy

```bash
vercel --prod
```

## Step 8: Final Checks (5 minutes)

### 8.1 Test Production

1. Visit your Vercel URL
2. Sign up with real email
3. Verify email works
4. Test CV optimization
5. Test payment flow

### 8.2 Monitor

- Supabase Dashboard: Check database
- Vercel Dashboard: Check logs
- Stripe Dashboard: Check payments
- OpenAI Dashboard: Check usage

## Troubleshooting

### "Failed to create CV version"
- Check Supabase connection
- Verify RLS policies are set up
- Check user is authenticated

### "Insufficient credits"
- Check user's `credits_remaining` in database
- Verify subscription status

### "OpenAI API error"
- Check API key is correct
- Verify you have credits
- Check usage limits

### "Stripe webhook failed"
- Verify webhook secret is correct
- Check endpoint URL is correct
- Test webhook in Stripe dashboard

### "PDF generation failed"
- Check storage bucket exists
- Verify bucket is public
- Check file upload permissions

## Production Checklist

- [ ] All environment variables set
- [ ] Supabase database schema applied
- [ ] Storage bucket created and public
- [ ] Stripe products created
- [ ] Stripe webhook configured
- [ ] OpenAI credits added
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Error monitoring set up (Sentry)
- [ ] Analytics configured
- [ ] Backup strategy in place
- [ ] Rate limiting configured
- [ ] Email service configured (optional)

## Maintenance

### Daily
- Monitor OpenAI costs
- Check error logs
- Review new signups

### Weekly
- Review Stripe payments
- Check database size
- Update dependencies

### Monthly
- Backup database
- Review analytics
- Update documentation

## Support

If you encounter issues:
1. Check logs in Vercel dashboard
2. Check Supabase logs
3. Review this guide
4. Check GitHub issues
5. Contact support

## Next Steps

After setup:
1. Customize landing page
2. Add your branding
3. Set up custom domain
4. Configure email templates
5. Add analytics
6. Set up monitoring
7. Create documentation
8. Launch marketing

---

Congratulations! Your APPLICANT-OS instance is now live! 🎉
