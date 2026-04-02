# APPLICANT-OS

A high-stakes, autonomous job application system powered by multi-agent AI architecture.

## 🎯 System Architecture

### Multi-Agent "Blackboard" System

**AGENT 1: THE INFILTRATOR** (Adversarial Analyst)
- Deconstructs job descriptions and company culture
- Identifies ATS score weights and hidden killer questions
- Answers: "If I were a cold algorithm, what 3 things would make me reject this human?"

**AGENT 2: THE ARCHITECT** (Dynamic CV Engine)
- Performs semantic injection on user's CV
- Creates 99% ATS match without hallucinations
- Outputs ATS-native PDF (standard fonts, no columns, machine-readable)

**AGENT 3: THE AUDITOR** (Quality Control)
- Attempts to REJECT the Architect's CV using simulated ATS parser
- Iteratively forces rewrites until >98% match achieved
- Only releases file with "Verified Access" token

**AGENT 4: THE GHOST-BROWSER** (Automation Engine)
- Uses Playwright for browser automation
- Auto-fills web forms (Workday, Greenhouse, etc.)
- Generates context-aware answers to tricky questions

## 🚀 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, LangChain
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Automation**: Playwright
- **PDF Generation**: pdf-lib

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Configure Supabase
# 1. Create a Supabase project
# 2. Run the SQL schema from lib/supabase/schema.sql
# 3. Add your Supabase credentials to .env.local

# Add OpenAI API key to .env.local
OPENAI_API_KEY=your_key_here

# Run development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the schema from `lib/supabase/schema.sql`
4. Copy your project URL and anon key to `.env.local`

## 🎮 Usage

### 1. Upload CV and Job Description

- Upload your CV (PDF, TXT, DOC, DOCX)
- Paste the full job description
- Optionally add application URL for auto-apply
- Optionally add company context for better optimization

### 2. Watch the War Room

The system will:
- Analyze the job description (INFILTRATOR)
- Optimize your CV (ARCHITECT)
- Validate the optimization (AUDITOR)
- Iterate until >98% ATS match

### 3. Download or Auto-Apply

- Download the optimized CV
- Or use auto-apply to fill out the application form automatically

## 🏗️ Project Structure

```
applicant-os/
├── app/
│   ├── api/
│   │   ├── process/          # Main processing endpoint
│   │   └── auto-apply/       # Auto-apply endpoint
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── UploadZone.tsx        # CV/JD upload interface
│   └── WarRoom.tsx           # Live agent communication log
├── lib/
│   ├── agents/
│   │   ├── infiltrator.ts    # Job analysis agent
│   │   ├── architect.ts      # CV optimization agent
│   │   ├── auditor.ts        # Quality control agent
│   │   └── ghost-browser.ts  # Auto-apply agent
│   ├── blackboard/
│   │   └── orchestrator.ts   # Multi-agent coordinator
│   └── supabase/
│       ├── client.ts
│       └── schema.sql
└── README.md
```

## 🔐 Security Features

- Complete PII scrubbing during AI processing
- Row-level security in Supabase
- No data stored in AI provider logs
- Secure credential handling

## 🎨 UI Features

- Dark-mode "War Room" dashboard
- Terminal-style live agent logs
- Real-time progress tracking
- Cyber-security aesthetic

## 📊 Database Schema

### Tables

- `users` - User accounts
- `cv_versions` - CV optimization versions
- `job_applications` - Application tracking
- `agent_logs` - Real-time agent communication logs

## 🤖 Agent System Prompts

All agent prompts are designed for:
- Maximum precision
- Zero hallucinations
- Adversarial thinking
- Iterative improvement

See individual agent files in `lib/agents/` for full prompts.

## 🚧 Roadmap

- [ ] PDF generation with pdf-lib
- [ ] Support for more ATS systems
- [ ] Multi-language support
- [ ] Chrome extension for one-click apply
- [ ] Analytics dashboard
- [ ] A/B testing for CV variations

## 📝 License

MIT

## ⚠️ Disclaimer

This tool is designed to help candidates present their genuine qualifications effectively. Never fabricate experience or qualifications. Use responsibly and ethically.
