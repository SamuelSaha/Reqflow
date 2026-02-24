"use client";

import { PageShell } from "@/components/layout";
import {
  HeroSection,
  TrustLogos,
  ProblemSection,
} from "@/components/landing/HeroSection";
import { SocialProof } from "@/components/landing/GridSection";
import { FinalCTA } from "@/components/landing/BottomSection";

export default function ReqflowLanding() {
  return (
    <PageShell>
      <HeroSection />
      <TrustLogos />
      <ProblemSection />
      <SocialProof />
      <FinalCTA />
    </PageShell>
  );
}
