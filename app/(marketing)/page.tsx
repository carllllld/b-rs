import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 py-20 sm:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
              Land Your Dream Job with
              <span className="text-blue-600"> AI-Powered</span> Applications
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              Our advanced AI agents optimize your CV for ATS systems, analyze job descriptions, and auto-apply to positions - increasing your interview rate by 10x.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Start Free Trial
                <ArrowRight className="ml-2 inline h-5 w-5" />
              </Link>
              <Link
                href="/demo"
                className="text-lg font-semibold leading-6 text-gray-900"
              >
                Watch Demo <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • 3 free optimizations
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to land interviews
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Powered by GPT-4 and advanced multi-agent AI systems
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Zap className="h-6 w-6 text-blue-600" />}
                title="ATS Optimization"
                description="Our AI analyzes job descriptions and optimizes your CV to pass Applicant Tracking Systems with 98%+ match rates."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6 text-blue-600" />}
                title="Smart Analysis"
                description="Identifies hidden requirements, cultural signals, and killer questions that would auto-reject candidates."
              />
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
                title="Auto-Apply"
                description="Automatically fills out job applications on Workday, Greenhouse, and other platforms with intelligent form detection."
              />
              <FeatureCard
                icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
                title="Quality Control"
                description="Our Auditor agent iteratively improves your CV until it achieves a verified 98%+ ATS score."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6 text-blue-600" />}
                title="Real-time Tracking"
                description="Watch our AI agents work in real-time through our War Room dashboard with live logs."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6 text-blue-600" />}
                title="Privacy First"
                description="Complete PII scrubbing during processing. Your data is encrypted and never shared."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Trusted by job seekers worldwide
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <StatCard number="10,000+" label="CVs Optimized" />
              <StatCard number="98%" label="ATS Pass Rate" />
              <StatCard number="5x" label="More Interviews" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to land your dream job?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Start optimizing your applications today with 3 free credits.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-sm hover:bg-gray-50"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-gray-900">{number}</div>
      <div className="mt-2 text-sm text-gray-600">{label}</div>
    </div>
  );
}
