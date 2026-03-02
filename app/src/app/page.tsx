"use client";

import { PageShell } from "@/components/layout";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Hero section loads immediately (above the fold)
const HeroSection = dynamic(
  () => import("@/components/landing/HeroSection").then((mod) => mod.HeroSection),
  { ssr: true }
);

// Below-fold sections lazy-loaded with Suspense
const TrustLogos = dynamic(
  () => import("@/components/landing/HeroSection").then((mod) => mod.TrustLogos),
  { loading: () => <SectionSkeleton height={100} />, ssr: false }
);

const PainPoints = dynamic(
  () => import("@/components/landing/PainPoints").then((mod) => mod.PainPoints),
  { loading: () => <SectionSkeleton height={700} />, ssr: false }
);

const ProductFlow = dynamic(
  () => import("@/components/landing/ProductFlow").then((mod) => mod.ProductFlow),
  { loading: () => <SectionSkeleton height={800} />, ssr: false }
);

const Personas = dynamic(
  () => import("@/components/landing/Personas").then((mod) => mod.Personas),
  { loading: () => <SectionSkeleton height={500} />, ssr: false }
);

const Features = dynamic(
  () => import("@/components/landing/Features").then((mod) => mod.Features),
  { loading: () => <SectionSkeleton height={500} />, ssr: false }
);

const MeasuredOutcomes = dynamic(
  () => import("@/components/landing/MeasuredOutcomes").then((mod) => mod.MeasuredOutcomes),
  { loading: () => <SectionSkeleton height={400} />, ssr: false }
);

const Integrations = dynamic(
  () => import("@/components/landing/Integrations").then((mod) => mod.Integrations),
  { loading: () => <SectionSkeleton height={400} />, ssr: false }
);

const Pricing = dynamic(
  () => import("@/components/landing/BottomSection").then((mod) => mod.Pricing),
  { loading: () => <SectionSkeleton height={600} />, ssr: false }
);

const FAQ = dynamic(
  () => import("@/components/landing/BottomSection").then((mod) => mod.FAQ),
  { loading: () => <SectionSkeleton height={500} />, ssr: false }
);

const FinalCTA = dynamic(
  () => import("@/components/landing/BottomSection").then((mod) => mod.FinalCTA),
  { loading: () => <SectionSkeleton height={300} />, ssr: false }
);

const MobileStickyCTA = dynamic(
  () => import("@/components/landing/MobileStickyCTA").then((mod) => mod.MobileStickyCTA),
  { ssr: false }
);

function SectionSkeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse bg-slate-100"
      style={{ height: `${height}px` }}
    />
  );
}

/**
 * 🔒 SECURITY NOTE (issue #118):
 * This component uses dangerouslySetInnerHTML for JSON-LD structured data.
 * This is SAFE because:
 * 1. Data is always static (no user input)
 * 2. JSON.stringify() properly escapes all content
 * 3. Script type="application/ld+json" is NOT executed as JavaScript
 * 4. Google/search engines parse this as structured data only
 *
 * React does not support children in <script> tags, so dangerouslySetInnerHTML
 * is the only way to inject JSON-LD. This is the standard Next.js pattern.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Safe: data is always static, JSON.stringify escapes content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ReqflowLanding() {
  const baseUrl = 'https://reqflow.com';

  const faqs = [
    {
      question: "How fast can we get Reqflow running?",
      answer: "Most teams go live in under 10 minutes. Connect Slack, set your first approval rule, and start receiving purchase requests. No onboarding call required.",
    },
    {
      question: "Is Reqflow actually free right now?",
      answer: "Yes. During early access, everything is free with no limits. No credit card, no trial countdown. We want you to use it, stress-test it, and tell us what to build next.",
    },
    {
      question: "What tools does Reqflow integrate with?",
      answer: "Slack, Microsoft Teams, QuickBooks, Xero, Google Workspace, and Pennylane. We add new integrations based on what early users ask for.",
    },
    {
      question: "Is our data secure and GDPR compliant?",
      answer: "Yes. All data is encrypted at rest and in transit, hosted in EU data centers, and fully GDPR compliant. We never share your data with third parties.",
    },
    {
      question: "We're only 15 people. Is this overkill for us?",
      answer: "Not at all. Reqflow was built specifically for teams of 5 to 50. The smaller you are, the less you can afford to waste time on manual procurement.",
    },
  ];

  return (
    <>
      <PageShell>
        {/* Organization Schema */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Reqflow",
            url: baseUrl,
            logo: `${baseUrl}/logo.png`,
            description: "Procurement software for teams of 5-50. Track SaaS spend, catch duplicates, never miss renewals.",
          }}
        />

        {/* SoftwareApplication Schema */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Reqflow",
            applicationCategory: "BusinessApplication",
            applicationSubCategory: "Procurement Software",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Free during early access",
              availability: "https://schema.org/InStock",
            },
            description: "Procurement software for teams of 5-50. Track SaaS spend, catch duplicates, never miss renewals.",
            featureList: [
              "Smart Intake with AI-powered forms",
              "Approval Workflows with Slack integration",
              "Budget Tracking with enforcement",
              "Renewal Tracking with notice-window alerts",
            ],
          }}
        />

        {/* FAQ Schema */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }}
        />

        {/* Section 1: Hero */}
        <Suspense fallback={<SectionSkeleton height={600} />}>
          <HeroSection />
        </Suspense>

        {/* Section 2: Trust Logos */}
        <Suspense fallback={<SectionSkeleton height={100} />}>
          <TrustLogos />
        </Suspense>

        {/* Section 3: Problem (Before/After + Metrics) */}
        <Suspense fallback={<SectionSkeleton height={700} />}>
          <PainPoints />
        </Suspense>

        {/* Section 4: Product Flow (3 Steps) */}
        <Suspense fallback={<SectionSkeleton height={800} />}>
          <ProductFlow />
        </Suspense>

        {/* Section 5: Personas */}
        <Suspense fallback={<SectionSkeleton height={500} />}>
          <Personas />
        </Suspense>

        {/* Section 6: Features (Dark Grid) */}
        <Suspense fallback={<SectionSkeleton height={500} />}>
          <Features />
        </Suspense>

        {/* Section 7: Measured Outcomes */}
        <Suspense fallback={<SectionSkeleton height={400} />}>
          <MeasuredOutcomes />
        </Suspense>

        {/* Section 8: Integrations */}
        <Suspense fallback={<SectionSkeleton height={400} />}>
          <Integrations />
        </Suspense>

        {/* Section 9: Pricing */}
        <Suspense fallback={<SectionSkeleton height={600} />}>
          <Pricing />
        </Suspense>

        {/* Section 10: FAQ */}
        <Suspense fallback={<SectionSkeleton height={500} />}>
          <FAQ />
        </Suspense>

        {/* Section 11: Final CTA (Dark) */}
        <Suspense fallback={<SectionSkeleton height={300} />}>
          <FinalCTA />
        </Suspense>
      </PageShell>

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA />
    </>
  );
}
