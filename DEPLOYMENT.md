# Deployment Guide

## Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key
- Vercel account (recommended) or any Node.js hosting

## Step-by-Step Deployment

### 1. Supabase Setup

```bash
# Create a Supabase project at https://supabase.com

# Run the SQL schema
# Go to SQL Editor in Supabase dashboard
# Copy and paste contents of lib/supabase/schema.sql
# Click "Run"
```

### 2. Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### 4. Alternative: Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up

# Add environment variables
railway variables set OPENAI_API_KEY=sk-...
```

### 5. Alternative: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t applicant-os .
docker run -p 3000:3000 --env-file .env.local applicant-os
```

## Production Checklist

- [ ] Set `headless: true` in ghost-browser.ts
- [ ] Configure CORS for Supabase
- [ ] Set up rate limiting
- [ ] Configure error monitoring (Sentry)
- [ ] Set up analytics
- [ ] Configure backup strategy
- [ ] Test all agent workflows
- [ ] Set up CI/CD pipeline

## Scaling Considerations

### Database
- Enable connection pooling in Supabase
- Add indexes for frequently queried fields
- Set up read replicas for high traffic

### API
- Implement request queuing for agent processing
- Use Redis for caching
- Set up background job processing

### Costs
- OpenAI API: ~$0.03 per CV optimization
- Supabase: Free tier supports 500MB database
- Vercel: Free tier supports hobby projects

## Monitoring

```bash
# Set up Vercel Analytics
npm i @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## Security

- Enable RLS (Row Level Security) in Supabase
- Use environment variables for all secrets
- Implement rate limiting
- Add CAPTCHA for public endpoints
- Regular security audits

## Support

For issues, check:
- Supabase logs
- Vercel function logs
- OpenAI API status
- Browser console errors
