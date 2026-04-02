# APPLICANT-OS - AI-Powered Job Application Platform

A production-ready SaaS platform that uses advanced AI agents to optimize CVs for ATS systems and automate job applications.

## 🚀 Features

### For Job Seekers
- **AI-Powered CV Optimization**: Multi-agent system analyzes job descriptions and optimizes your CV for 98%+ ATS compatibility
- **Smart Job Analysis**: Identifies hidden requirements, cultural signals, and potential rejection triggers
- **Auto-Apply**: Automatically fills out job applications on major platforms (Workday, Greenhouse, etc.)
- **Real-time Processing**: Watch AI agents work through live logs
- **Application Tracking**: Manage all your applications in one dashboard
- **PDF Generation**: ATS-friendly PDFs with proper formatting and metadata

### Technical Features
- **Multi-Agent AI System**: Infiltrator, Architect, Auditor, and Ghost Browser agents
- **Stripe Integration**: Complete payment processing with webhooks
- **Supabase Backend**: Real-time database with Row Level Security
- **Authentication**: Secure user management with Supabase Auth
- **Credit System**: Usage tracking and subscription management
- **Professional UI**: Clean, modern interface built with Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Stripe account
- (Optional) Resend account for emails

## 🛠️ Installation

### 1. Clone and Install

```bash
git clone <your-repo>
cd applicant-os
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `lib/supabase/schema-complete.sql`
3. Create a storage bucket named `cv-files` (public)
4. Copy your project URL and keys

### 3. Set Up Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Create products and prices:
   - Pro Plan: $29/month
   - Enterprise Plan: $99/month
3. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhook`
4. Copy webhook secret and API keys

### 4. Configure Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_your-pro-id
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE=price_your-enterprise-id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-random-string-here
NEXTAUTH_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
applicant-os/
├── app/
│   ├── (marketing)/          # Landing, pricing pages
│   ├── (auth)/                # Login, signup
│   ├── (dashboard)/           # Dashboard, optimize, applications
│   ├── api/                   # API routes
│   │   ├── auth/              # Authentication
│   │   ├── stripe/            # Payment processing
│   │   ├── process/           # CV optimization
│   │   └── auto-apply/        # Auto-apply functionality
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── agents/                # AI agents
│   │   ├── infiltrator.ts     # Job analysis
│   │   ├── architect.ts       # CV optimization
│   │   ├── auditor.ts         # Quality control
│   │   ├── ghost-browser.ts   # Auto-apply
│   │   └── pdf-generator.ts   # PDF creation
│   ├── blackboard/
│   │   └── orchestrator.ts    # Multi-agent coordinator
│   ├── stripe/                # Stripe configuration
│   ├── supabase/              # Database client & schema
│   ├── hooks/                 # React hooks
│   └── utils/                 # Utilities
├── components/                # Reusable components
└── README.md
```

## 🎯 How It Works

### 1. CV Optimization Process

1. **Upload**: User uploads CV and job description
2. **Infiltrator Agent**: Analyzes job description for ATS keywords and hidden requirements
3. **Architect Agent**: Optimizes CV content with semantic injection
4. **Auditor Agent**: Validates optimization, iterates until 98%+ score
5. **PDF Generator**: Creates ATS-friendly PDF
6. **Result**: User gets optimized CV ready for submission

### 2. Auto-Apply Process

1. **Ghost Browser Agent**: Navigates to job application URL
2. **Form Detection**: Identifies all form fields
3. **Smart Mapping**: Maps CV data to form fields
4. **Context-Aware Answers**: Generates answers for custom questions
5. **Submission**: Fills and submits application

## 💳 Pricing Plans

- **Free**: 3 CV optimizations
- **Pro ($29/mo)**: 50 optimizations + auto-apply
- **Enterprise ($99/mo)**: Unlimited + API access

## 🔐 Security

- Row Level Security (RLS) in Supabase
- PII scrubbing during AI processing
- Secure credential handling
- HTTPS only in production
- Stripe PCI compliance

## 📊 Database Schema

Key tables:
- `profiles`: User accounts and subscription info
- `cv_versions`: CV optimization history
- `job_applications`: Application tracking
- `agent_logs`: Real-time processing logs
- `usage_tracking`: Credit usage
- `payment_history`: Transaction records

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel
```

Add environment variables in Vercel dashboard.

### Docker

```bash
docker build -t applicant-os .
docker run -p 3000:3000 --env-file .env.local applicant-os
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 📈 Monitoring

- Supabase Dashboard: Database metrics
- Vercel Analytics: Performance monitoring
- Stripe Dashboard: Payment tracking
- OpenAI Usage: API costs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📝 License

MIT License - see LICENSE file

## 🆘 Support

- Documentation: [docs.applicant-os.com](https://docs.applicant-os.com)
- Email: support@applicant-os.com
- Discord: [Join our community](https://discord.gg/applicant-os)

## ⚠️ Important Notes

### OpenAI Costs
- ~$0.03-0.05 per CV optimization
- Monitor usage in OpenAI dashboard

### Stripe Setup
- Test mode for development
- Production mode requires business verification
- Set up webhooks for both environments

### Supabase Limits
- Free tier: 500MB database, 1GB file storage
- Upgrade for production use

## 🎓 Best Practices

1. **Always test in development first**
2. **Monitor OpenAI API costs**
3. **Set up error tracking (Sentry)**
4. **Regular database backups**
5. **Keep dependencies updated**
6. **Use environment-specific configs**

## 🔄 Updates

Check [CHANGELOG.md](CHANGELOG.md) for version history.

---

Built with ❤️ using Next.js, Supabase, OpenAI, and Stripe
