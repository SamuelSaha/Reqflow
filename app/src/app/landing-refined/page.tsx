/**
 * Refined Landing Page - Beast Mode Marketing
 * Aesthetic: Refined Brutalism
 * Design: Bold typography, geometric precision, orchestrated animations
 *
 * View at: /landing-refined
 */

import { Metadata } from 'next';
import { HeroRefined } from '@/components/marketing/hero/HeroRefined';
import { ProblemSection } from '@/components/marketing/sections/ProblemSection';
import { ProductFlow } from '@/components/marketing/sections/ProductFlow';
import { FeatureGrid } from '@/components/marketing/sections/FeatureGrid';
import { PricingRefined } from '@/components/marketing/sections/PricingRefined';
import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';

export const metadata: Metadata = {
  title: 'Stop Guessing What You Own - Reqflow',
  description: 'The connected procurement workflow that captures why you bought it, who owns it, what it costs, and when you can leave — automatically.',
};

export default function RefinedLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <MarketingNav />

      {/* Main content */}
      <main id="main-content">
        {/* Hero - Server-side rendered for optimal LCP */}
        <HeroRefined />

        {/* Problem/Solution - Client-side with scroll reveal */}
        <ProblemSection />

        {/* Product Flow - Interactive 3-step demo */}
        <ProductFlow />

        {/* Feature Grid - Expandable cards */}
        <FeatureGrid />

        {/* Pricing - Tier comparison */}
        <PricingRefined />

        {/* Trust Bar - Social proof */}
        <TrustBar />

        {/* FAQ - Common questions */}
        <FAQSection />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}

/**
 * Trust Bar - Simple social proof
 */
function TrustBar() {
  const stats = [
    { value: '500+', label: 'Teams using Reqflow' },
    { value: '$2M+', label: 'Spend tracked' },
    { value: '98%', label: 'Customer satisfaction' },
    { value: '12hrs', label: 'Avg time saved/month' }
  ];

  return (
    <section className="py-16 bg-mkt-slate-50 border-y-2 border-mkt-slate-200">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-display text-5xl text-mkt-deep mb-2">{stat.value}</div>
              <div className="text-body text-sm text-mkt-slate-600 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * FAQ Section
 */
function FAQSection() {
  const faqs = [
    {
      question: 'How fast can we get Reqflow running?',
      answer: 'Most teams go live in under 10 minutes. Connect Slack, set your first approval rule, and start receiving purchase requests. No onboarding call required.'
    },
    {
      question: 'Is Reqflow actually free right now?',
      answer: 'Yes. During early access, everything is free with no limits. No credit card, no trial countdown. We want you to use it, stress-test it, and tell us what to build next.'
    },
    {
      question: 'What tools does Reqflow integrate with?',
      answer: 'Slack, Microsoft Teams, QuickBooks, Xero, Google Workspace, and Pennylane. We add new integrations based on what early users ask for.'
    },
    {
      question: 'Is our data secure and GDPR compliant?',
      answer: 'Yes. All data is encrypted at rest and in transit, hosted in EU data centers, and fully GDPR compliant. We never share your data with third parties.'
    },
    {
      question: "We're only 15 people. Is this overkill for us?",
      answer: 'Not at all. Reqflow was built specifically for teams of 5 to 50. The smaller you are, the less you can afford to waste time on manual procurement.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-display text-5xl text-mkt-deep mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="card-brutal bg-mkt-slate-50 border-mkt-slate-700 shadow-brutal hover:shadow-brutal-md transition-all group"
              >
                <summary className="cursor-pointer list-none p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-body-bold text-lg text-mkt-deep">
                      {faq.question}
                    </h3>
                    <span className="text-mkt-accent text-2xl group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </div>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-body text-mkt-slate-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Final CTA - Dark section
 */
function FinalCTA() {
  return (
    <section className="py-24 bg-mkt-deep relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mkt-accent opacity-10 blur-3xl rounded-full" />
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-display text-6xl text-white mb-6 leading-tight">
            Ready to take control of procurement?
          </h2>
          <p className="text-body text-xl text-mkt-slate-300 mb-10 leading-relaxed">
            Join 500+ teams using Reqflow. Free during early access. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/signup"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 text-body-bold text-lg bg-mkt-accent text-white border-2 border-white shadow-brutal-md hover:shadow-brutal-lg transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1"
            >
              <span>Start Free Trial</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 text-body-bold text-lg bg-white text-mkt-deep border-2 border-white shadow-brutal-md hover:shadow-brutal-lg transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1"
            >
              <span>Book a Demo</span>
            </a>
          </div>

          <p className="text-sm text-mkt-slate-400 mt-8">
            No credit card required • Free during early access • GDPR compliant
          </p>
        </div>
      </div>
    </section>
  );
}
