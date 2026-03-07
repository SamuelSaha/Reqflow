import { Suspense } from 'react';

// Marketing components
import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { HeroRefined } from '@/components/marketing/hero/HeroRefined';
import { TrustBar } from '@/components/marketing/sections/TrustBar';
import { ProblemSection } from '@/components/marketing/sections/ProblemSection';
import { ProductFlow } from '@/components/marketing/sections/ProductFlow';
import { FinalCTA } from '@/components/marketing/sections/FinalCTA';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';
import { MobileStickyCTA } from '@/components/marketing/MobileStickyCTA';

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

      {/* Page */}
      <main id="main-content">
        <MarketingNav />
        <HeroRefined />
        <TrustBar />
        <ProblemSection />
        <ProductFlow />
        <FinalCTA />
        <MarketingFooter />
      </main>

      <Suspense fallback={null}>
        <MobileStickyCTA />
      </Suspense>
    </>
  );
}
