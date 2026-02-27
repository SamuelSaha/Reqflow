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

const FeatureGrid = dynamic(
  () => import("@/components/landing/FeatureGrid").then((mod) => mod.FeatureGrid),
  {
    loading: () => <SectionSkeleton height={500} />,
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

function SectionSkeleton({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse bg-slate-100"
      style={{ height: `${height}px` }}
    />
  );
}

export default function ReqflowLanding() {
  return (
    <PageShell>
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
      <Suspense fallback={<SectionSkeleton height={500} />}>
        <FeatureGrid />
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
  );
}
