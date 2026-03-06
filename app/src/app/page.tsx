import { Suspense } from 'react';

// Marketing components
import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { HeroRefined } from '@/components/marketing/hero/HeroRefined';
import { TrustBar } from '@/components/marketing/sections/TrustBar';
import { ProblemSection } from '@/components/marketing/sections/ProblemSection';
import { ProductFlow } from '@/components/marketing/sections/ProductFlow';
import { PersonasSection } from '@/components/marketing/sections/PersonasSection';
import { FeatureGrid } from '@/components/marketing/sections/FeatureGrid';
import { MetricsSection } from '@/components/marketing/sections/MetricsSection';
import { IntegrationsSection } from '@/components/marketing/sections/IntegrationsSection';
import { PricingSection } from '@/components/marketing/sections/PricingSection';
import { FAQSection } from '@/components/marketing/sections/FAQSection';
import { FinalCTA } from '@/components/marketing/sections/FinalCTA';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';
import { MobileStickyCTA } from '@/components/marketing/MobileStickyCTA';

const faqs = [
  {
    question: 'How fast can we get Reqflow running?',
    answer:
      'Most teams go live in under 10 minutes. Connect Slack, set your first approval rule, and start receiving purchase requests. No onboarding call required.',
  },
  {
    question: 'Is Reqflow actually free right now?',
    answer:
      'Yes. During early access, everything is free with no limits. No credit card, no trial countdown. We want you to use it, stress-test it, and tell us what to build next.',
  },
  {
    question: 'What tools does Reqflow integrate with?',
    answer:
      'Slack, Microsoft Teams, QuickBooks, Xero, Google Workspace, and Pennylane. We add new integrations based on what early users ask for.',
  },
  {
    question: 'Is our data secure and GDPR compliant?',
    answer:
      'Yes. All data is encrypted at rest and in transit, hosted in EU data centers, and fully GDPR compliant. We never share your data with third parties.',
  },
  {
    question: "We're only 15 people. Is this overkill for us?",
    answer:
      "Not at all. Reqflow was built specifically for teams of 5 to 50. The smaller you are, the less you can afford to waste time on manual procurement.",
  },
];

/**
 * JSON-LD structured data for SEO
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/<\/script/gi, "<\\/script") }}
    />
  );
}

export default function ReqflowLanding() {
  const baseUrl = 'https://reqflow.com';

  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Reqflow',
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          description:
            'Procurement software for teams of 5-50. Track SaaS spend, catch duplicates, never miss renewals.',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Reqflow',
          applicationCategory: 'BusinessApplication',
          applicationSubCategory: 'Procurement Software',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free during early access',
            availability: 'https://schema.org/InStock',
          },
          description:
            'Procurement software for teams of 5-50. Track SaaS spend, catch duplicates, never miss renewals.',
          featureList: [
            'Smart Intake with AI-powered forms',
            'Approval Workflows with Slack integration',
            'Budget Tracking with enforcement',
            'Renewal Tracking with notice-window alerts',
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }}
      />

      {/* Page */}
      <main id="main-content">
        <MarketingNav />
        <HeroRefined />
        <TrustBar />
        <ProblemSection />
        <ProductFlow />
        <PersonasSection />
        <FeatureGrid />
        <MetricsSection />
        <IntegrationsSection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
        <MarketingFooter />
      </main>

      <Suspense fallback={null}>
        <MobileStickyCTA />
      </Suspense>
    </>
  );
}
