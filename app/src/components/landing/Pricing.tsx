/**
 * Pricing Section
 * Simple, transparent pricing for small businesses
 */

import { Check } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PrimaryCta } from "@/components/ui/cta-button";

const features = [
  "Unlimited users",
  "Unlimited purchase requests",
  "Slack + email integrations",
  "QuickBooks & Xero sync",
  "Budget tracking & alerts",
  "Renewal tracking with notice windows",
  "Vendor management",
  "Contract storage",
  "Purchase order generation",
  "Audit trail & reporting",
];

export function Pricing() {
  return (
    <Section background="white" className="relative">
      <Container size="default">
        <div className="py-20 md:py-28">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-h2 text-slate-900 mb-4">
              Unlimited users. Always.
            </h2>
            <p className="text-body-lg text-slate-600 max-w-2xl mx-auto">
              No per-seat pricing. No hidden fees. Built for businesses of 5-50 people who need procurement without the enterprise price tag.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-lg mx-auto">
            <div className="p-8 md:p-12 rounded-3xl border border-slate-200 bg-white shadow-lg">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="text-6xl md:text-7xl font-bold text-slate-900 mb-2">
                  Free
                </div>
                <div className="text-body-lg text-slate-600">
                  during early access
                </div>
              </div>

              {/* CTA */}
              <div className="mb-10">
                <PrimaryCta
                  href="/signup"
                  size="large"
                  icon="arrow"
                  analyticsEvent="pricing_cta_click"
                  className="w-full justify-center"
                >
                  Start Free Trial
                </PrimaryCta>
                <p className="text-center text-body-sm text-slate-500 mt-3">
                  No credit card required
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <div className="text-body-sm font-semibold text-slate-900 mb-5 uppercase tracking-wide">
                  Everything included
                </div>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={3} />
                    </div>
                    <span className="text-body text-slate-700 leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Note */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <p className="text-body-sm text-slate-600 text-center">
                  Early access pricing will lock in when we launch. Join now to secure your rate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
