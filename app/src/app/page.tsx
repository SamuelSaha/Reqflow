"use client";

import { PageShell } from "@/components/layout";
import {
  HeroSection,
  ProductShowcaseSection,
  TrustLogos,
  ProblemSection,
} from "@/components/landing/HeroSection";
import { CaseBuilderSpotlight } from "@/components/landing/CaseBuilderSection";
import { SocialProof } from "@/components/landing/GridSection";
import { ProductScreenshots } from "@/components/landing/ProductScreenshots";
import { FinalCTA } from "@/components/landing/BottomSection";

export default function ReqflowLanding() {
  return (
    <PageShell>
      <HeroSection />
      <ProductShowcaseSection />
      <TrustLogos />
      <ProblemSection />
      <ProductScreenshots />
      <CaseBuilderSpotlight />
      <SocialProof />
      <FinalCTA />
    </PageShell>
  );
}
