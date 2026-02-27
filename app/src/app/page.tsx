"use client";

import { PageShell } from "@/components/layout";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load landing page sections for better initial bundle size
// Hero section loads immediately (above the fold)
const HeroSection = dynamic(
  () => import("@/components/landing/HeroSection").then((mod) => mod.HeroSection),
  { ssr: true } // Keep SSR for SEO-critical hero section
);

// Below-fold sections lazy-loaded with Suspense
const ProductShowcaseSection = dynamic(
  () => import("@/components/landing/HeroSection").then((mod) => mod.ProductShowcaseSection),
  {
    loading: () => <SectionSkeleton height={400} />,
    ssr: false,
  }
);

const TrustLogos = dynamic(
  () => import("@/components/landing/HeroSection").then((mod) => mod.TrustLogos),
  {
    loading: () => <SectionSkeleton height={120} />,
    ssr: false,
  }
);

const ProblemSection = dynamic(
  () => import("@/components/landing/HeroSection").then((mod) => mod.ProblemSection),
  {
    loading: () => <SectionSkeleton height={300} />,
    ssr: false,
  }
);

const ProductScreenshots = dynamic(
  () => import("@/components/landing/ProductScreenshots").then((mod) => mod.ProductScreenshots),
  {
    loading: () => <SectionSkeleton height={600} />,
    ssr: false,
  }
);

const FeatureTabs = dynamic(
  () => import("@/components/landing/FeatureTabs").then((mod) => mod.FeatureTabs),
  {
    loading: () => <SectionSkeleton height={600} />,
    ssr: false,
  }
);

const UseCaseTabs = dynamic(
  () => import("@/components/landing/UseCaseTabs").then((mod) => mod.UseCaseTabs),
  {
    loading: () => <SectionSkeleton height={550} />,
    ssr: false,
  }
);

const Testimonials = dynamic(
  () => import("@/components/landing/Testimonials").then((mod) => mod.Testimonials),
  {
    loading: () => <SectionSkeleton height={450} />,
    ssr: false,
  }
);

const CaseBuilderSpotlight = dynamic(
  () => import("@/components/landing/CaseBuilderSection").then((mod) => mod.CaseBuilderSpotlight),
  {
    loading: () => <SectionSkeleton height={400} />,
    ssr: false,
  }
);

const SocialProof = dynamic(
  () => import("@/components/landing/GridSection").then((mod) => mod.SocialProof),
  {
    loading: () => <SectionSkeleton height={300} />,
    ssr: false,
  }
);

const FinalCTA = dynamic(
  () => import("@/components/landing/BottomSection").then((mod) => mod.FinalCTA),
  {
    loading: () => <SectionSkeleton height={200} />,
    ssr: false,
  }
);

const MobileStickyCTA = dynamic(
  () => import("@/components/landing/MobileStickyCTA").then((mod) => mod.MobileStickyCTA),
  {
    ssr: false,
  }
);

function SectionSkeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse bg-slate-100"
      style={{ height: `${height}px` }}
    />
  );
}

export default function ReqflowLanding() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://reqflow.com';

  // FAQ data for structured data schema
  const faqs = [
    {
      question: "How is Reqflow different from using spreadsheets for procurement?",
      answer: "Spreadsheets break down when your team hits 10-15 people. They live outside your workflow—nobody updates them, nobody checks them before buying, and they're always out of date. Reqflow lives where your team already works (Slack, email, web) and automatically captures every purchase request, duplicate check, and approval. The data stays current without anyone doing extra work.",
    },
    {
      question: "Do I need a procurement team to use procurement software?",
      answer: "No. That's exactly who we built Reqflow for—teams without procurement departments. If you're the founder, ops lead, or finance person handling purchases while also doing your actual job, this replaces the manual work. Set it up once (takes 2 minutes), and it runs itself. No training, no procurement expertise needed.",
    },
    {
      question: "Can Reqflow catch duplicate SaaS subscriptions before we buy them?",
      answer: "Yes. When someone submits a request, we check your existing tools and flag potential overlaps before the purchase happens. For example, if your design team already uses Figma and someone requests Sketch, we'll surface that immediately. Saves you from discovering duplicates months later when renewals hit.",
    },
  ];

  return (
    <>
      <PageShell>
        {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Reqflow",
            url: baseUrl,
            logo: `${baseUrl}/logo.png`,
            description: "Procurement software for teams of 5-50. Track SaaS spend, catch duplicates, never miss renewals.",
          }),
        }}
      />

      {/* SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
              "Connected Records - Tool to Contract to Subscription to Invoice",
              "Smart Approvals with Slack integration",
              "Budget Intelligence with auto-alerts",
              "Renewal Tracking with notice-window alerts",
            ],
          }),
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />

      <Suspense fallback={<SectionSkeleton height={600} />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={400} />}>
        <ProductShowcaseSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={120} />}>
        <TrustLogos />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={300} />}>
        <ProblemSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={600} />}>
        <ProductScreenshots />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={600} />}>
        <FeatureTabs />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={550} />}>
        <UseCaseTabs />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={450} />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={400} />}>
        <CaseBuilderSpotlight />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={300} />}>
        <SocialProof />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height={200} />}>
        <FinalCTA />
      </Suspense>
      </PageShell>

      {/* Mobile Sticky CTA - Shows on scroll for mobile users */}
      <MobileStickyCTA />
    </>
  );
}
