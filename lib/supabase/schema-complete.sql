-- Complete Production Schema for APPLICANT-OS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  credits_remaining INTEGER DEFAULT 3,
  total_applications INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV Versions table
CREATE TABLE IF NOT EXISTS public.cv_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_cv_text TEXT,
  original_cv_url TEXT,
  optimized_cv_url TEXT,
  optimized_cv_data JSONB,
  job_description TEXT NOT NULL,
  job_url TEXT,
  company_name TEXT,
  job_title TEXT,
  company_context TEXT,
  ats_score INTEGER DEFAULT 0,
  version_number INTEGER DEFAULT 1,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'verified', 'needs_review', 'failed')),
  infiltrator_analysis JSONB,
  architect_output JSONB,
  auditor_report JSONB,
  iterations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cv_version_id UUID REFERENCES public.cv_versions(id) ON DELETE CASCADE,
  job_url TEXT NOT NULL,
  company_name TEXT,
  job_title TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applying', 'submitted', 'failed', 'interview', 'rejected', 'accepted')),
  application_data JSONB,
  auto_applied BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Logs table
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_version_id UUID REFERENCES public.cv_versions(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL CHECK (agent_name IN ('INFILTRATOR', 'ARCHITECT', 'AUDITOR', 'GHOST_BROWSER', 'ORCHESTRATOR')),
  action TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  log_level TEXT DEFAULT 'info' CHECK (log_level IN ('info', 'warning', 'error', 'success')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  credits_per_month INTEGER NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('cv_optimization', 'auto_apply', 'pdf_download')),
  credits_used INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment History table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cv_versions_user_id ON public.cv_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_versions_status ON public.cv_versions(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_agent_logs_cv_version_id ON public.agent_logs(cv_version_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON public.agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for cv_versions
CREATE POLICY "Users can view own CV versions" ON public.cv_versions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own CV versions" ON public.cv_versions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own CV versions" ON public.cv_versions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own CV versions" ON public.cv_versions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for job_applications
CREATE POLICY "Users can view own applications" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON public.job_applications FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for agent_logs
CREATE POLICY "Users can view logs for own CVs" ON public.agent_logs FOR SELECT USING (
  cv_version_id IN (SELECT id FROM public.cv_versions WHERE user_id = auth.uid())
);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for payment_history
CREATE POLICY "Users can view own payments" ON public.payment_history FOR SELECT USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_versions_updated_at BEFORE UPDATE ON public.cv_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, stripe_price_id, price_monthly, credits_per_month, features) VALUES
('Free', 'price_free', 0.00, 3, '{"cv_optimizations": 3, "auto_apply": false, "priority_support": false, "analytics": false}'),
('Pro', 'price_pro_monthly', 29.00, 50, '{"cv_optimizations": 50, "auto_apply": true, "priority_support": true, "analytics": true, "custom_templates": true}'),
('Enterprise', 'price_enterprise_monthly', 99.00, 999, '{"cv_optimizations": 999, "auto_apply": true, "priority_support": true, "analytics": true, "custom_templates": true, "api_access": true, "dedicated_support": true}')
ON CONFLICT (name) DO NOTHING;
