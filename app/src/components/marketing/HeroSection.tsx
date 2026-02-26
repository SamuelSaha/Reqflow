/**
 * Hero Section - Primary landing section with value proposition
 * Design: Grid-based, centered content, warm background
 * Viewport: 70-80vh on desktop for above-the-fold impact
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PrimaryCta, SecondaryCta, CtaGroup } from "@/components/ui/cta-button";
import { SocialProofGroup } from "./SocialProof";

export function HeroSection() {
  return (
    <Section
      background="warm"
      className="min-h-[80vh] flex items-center justify-center"
      noPadding={false}
    >
      <Container size="narrow">
        {/* Grid-based layout for content organization */}
        <div className="grid grid-cols-1 gap-8 text-center">
          {/* Headline - Primary message */}
          <div className="space-y-4">
            <h1 className="text-hero text-slate-900">
              The connected procurement workflow for small teams
            </h1>

            {/* Subheadline - Supporting value prop */}
            <p className="text-body-lg text-slate-600 max-w-2xl mx-auto">
              Streamline vendor management, budget tracking, and renewals in one place.
              Never miss a deadline. Never overspend.
            </p>
          </div>

          {/* CTAs - Primary conversion actions */}
          <div className="space-y-6">
            <CtaGroup alignment="center">
              <PrimaryCta
                href="/signup"
                size="large"
                icon="arrow"
                analyticsEvent="hero_primary_click"
              >
                Start Free Trial
              </PrimaryCta>
              <SecondaryCta
                href="/contact"
                size="large"
                analyticsEvent="hero_secondary_click"
              >
                Book a Demo
              </SecondaryCta>
            </CtaGroup>

            {/* Social Proof - Trust signals */}
            <SocialProofGroup
              userCount={500}
              rating={{ rating: 4.9, reviews: 127 }}
              showNoCreditCard
              alignment="center"
              size="md"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
