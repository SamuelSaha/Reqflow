"use client";

import { Header, HeroSection, TrustLogos, ProblemSection } from "@/components/landing/HeroSection";
import { CoreFeatures, PersonaSection } from "@/components/landing/FeaturesSection";
import { FeaturesGrid, SocialProof, Integrations } from "@/components/landing/GridSection";
import { Pricing, FAQ, FinalCTA, Footer } from "@/components/landing/BottomSection";

export default function ReqflowLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <TrustLogos />
      <ProblemSection />
      <CoreFeatures />
      <PersonaSection />
      <FeaturesGrid />
      <SocialProof />
      <Integrations />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
