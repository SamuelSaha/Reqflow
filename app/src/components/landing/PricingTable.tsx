/**
 * Pricing Table with Grid-Based Comparison
 * Issue #59 - Implements 4-tier pricing structure
 * Strategy: PRICING_STRATEGY.md
 */

"use client";

import { Check, X } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingFeature {
  name: string;
  free: boolean | string;
  starter: boolean | string;
  business: boolean | string;
  enterprise: boolean | string;
}

const features: PricingFeature[] = [
  { name: "Users", free: "1-5", starter: "5-15", business: "15-50", enterprise: "50+" },
  { name: "Approval Workflows", free: "1", starter: "5", business: "Unlimited", enterprise: "Unlimited" },
  { name: "Requests & Approvals", free: true, starter: true, business: true, enterprise: true },
  { name: "Budget Tracking", free: "Basic", starter: "Basic", business: "Advanced", enterprise: "Advanced" },
  { name: "Slack Integration", free: false, starter: true, business: true, enterprise: true },
  { name: "QuickBooks/Xero", free: false, starter: false, business: true, enterprise: true },
  { name: "Purchase Orders", free: false, starter: false, business: true, enterprise: true },
  { name: "Contract Management", free: false, starter: false, business: true, enterprise: true },
  { name: "Vendor Database", free: false, starter: "100 vendors", business: "Unlimited", enterprise: "Unlimited" },
  { name: "Custom Fields", free: false, starter: true, business: true, enterprise: true },
  { name: "Analytics & Reporting", free: false, starter: true, business: true, enterprise: "Advanced BI" },
  { name: "API Access", free: false, starter: false, business: "1K calls/day", enterprise: "Unlimited" },
  { name: "SSO (SAML)", free: false, starter: false, business: true, enterprise: true },
  { name: "Audit Logs", free: false, starter: false, business: true, enterprise: true },
  { name: "Storage", free: false, starter: "10 GB", business: "50 GB", enterprise: "Unlimited" },
  { name: "Support", free: "Email", starter: "Chat", business: "Priority", enterprise: "Dedicated" },
];

interface PricingTier {
  name: string;
  price: string;
  priceMonthly?: string;
  billing: string;
  tagline: string;
  badge?: string;
  features: string[];
  cta: string;
  ctaVariant: "primary" | "secondary";
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    billing: "forever",
    tagline: "Perfect for small teams getting started",
    features: [
      "Unlimited requests & approvals",
      "Basic budget tracking",
      "Email notifications",
      "1 custom approval workflow",
      "Mobile app access",
    ],
    cta: "Get Started",
    ctaVariant: "secondary",
  },
  {
    name: "Starter",
    price: "$29",
    priceMonthly: "$35",
    billing: "/user/month",
    tagline: "For growing teams",
    badge: "14-Day Free Trial",
    features: [
      "Everything in Free, plus:",
      "Slack + Microsoft Teams",
      "5 custom workflows",
      "Advanced reporting",
      "Vendor database (100)",
      "Custom fields",
      "10 GB storage",
      "Email & chat support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "secondary",
  },
  {
    name: "Business",
    price: "$49",
    priceMonthly: "$59",
    billing: "/user/month",
    tagline: "For teams ready to scale",
    badge: "Most Popular",
    popular: true,
    features: [
      "Everything in Starter, plus:",
      "QuickBooks + Xero",
      "Purchase order automation",
      "Contract management",
      "Unlimited vendors",
      "Multi-department budgets",
      "50 GB storage",
      "API access (1K/day)",
      "SSO (SAML)",
      "Audit logs",
      "Priority support",
      "Onboarding call",
    ],
    cta: "Start Free Trial",
    ctaVariant: "primary",
  },
  {
    name: "Enterprise",
    price: "Custom",
    billing: "pricing",
    tagline: "For large organizations",
    features: [
      "Everything in Business, plus:",
      "Dedicated account manager",
      "Custom integrations",
      "Unlimited API calls",
      "Advanced security",
      "99.9% uptime SLA",
      "White-label branding",
      "Multi-entity support",
      "Advanced routing",
      "Procurement analytics",
      "Dedicated Slack channel",
      "Quarterly business reviews",
    ],
    cta: "Contact Sales",
    ctaVariant: "secondary",
  },
];

function FeatureIcon({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    if (value) {
      return (
        <div className="flex justify-center">
          <Check className="w-5 h-5 text-green-600" strokeWidth={2.5} />
        </div>
      );
    } else {
      return (
        <div className="flex justify-center">
          <X className="w-5 h-5 text-slate-300" strokeWidth={2} />
        </div>
      );
    }
  }
  return (
    <div className="text-center text-sm text-slate-700 font-medium">
      {value}
    </div>
  );
}

export function PricingTable() {
  return (
    <Section background="slate" className="relative">
      <Container size="default">
        <div className="py-20 md:py-28">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-4">
              Transparent pricing that scales with your team
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-2">
              Start free, upgrade as you grow. No hidden fees.
            </p>
            <p className="text-sm text-slate-500">
              Trusted by 500+ teams to manage $100M+ in procurement spend
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {tiers.map((tier, index) => (
              <Card
                key={index}
                className={cn(
                  "relative flex flex-col",
                  tier.popular && "lg:scale-105 border-2 border-blue-600 shadow-xl z-10",
                  !tier.popular && "border-slate-200"
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge
                      className={cn(
                        "px-3 py-1 text-xs font-semibold",
                        tier.popular
                          ? "bg-violet-500 text-white border-violet-600"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      {tier.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-8">
                  {/* Plan Name */}
                  <div className="text-2xl font-semibold text-slate-900 mb-2">
                    {tier.name}
                  </div>

                  {/* Tagline */}
                  <div className="text-sm text-slate-600 mb-6">
                    {tier.tagline}
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-5xl font-semibold text-slate-900">
                      {tier.price}
                    </span>
                    {tier.billing && (
                      <span className="text-sm text-slate-600 ml-1">
                        {tier.billing}
                      </span>
                    )}
                  </div>

                  {/* Monthly Price */}
                  {tier.priceMonthly && (
                    <div className="text-xs text-slate-500">
                      or {tier.priceMonthly}/user/month billed monthly
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-grow">
                  {/* Features List */}
                  <ul className="space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check
                          className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span className="text-sm text-slate-700 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <button
                    className={cn(
                      "w-full py-3 px-6 rounded-lg font-medium text-base transition-colors",
                      tier.ctaVariant === "primary" && tier.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : tier.ctaVariant === "primary"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                  >
                    {tier.cta}
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 overflow-x-auto">
            <h3 className="text-2xl font-semibold text-slate-900 mb-8 text-center">
              Feature Comparison
            </h3>

            <div className="min-w-[800px]">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 pb-4 border-b border-slate-200 mb-4">
                <div className="font-semibold text-slate-900">Feature</div>
                <div className="text-center font-semibold text-slate-900">Free</div>
                <div className="text-center font-semibold text-slate-900">Starter</div>
                <div className="text-center font-semibold text-slate-900">Business</div>
                <div className="text-center font-semibold text-slate-900">Enterprise</div>
              </div>

              {/* Table Rows */}
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-5 gap-4 py-4",
                    index !== features.length - 1 && "border-b border-slate-100"
                  )}
                >
                  <div className="text-sm font-medium text-slate-700">
                    {feature.name}
                  </div>
                  <FeatureIcon value={feature.free} />
                  <FeatureIcon value={feature.starter} />
                  <FeatureIcon value={feature.business} />
                  <FeatureIcon value={feature.enterprise} />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-sm text-slate-600 mb-4">
              14-day free trial on all paid plans • No credit card required • Cancel anytime
            </p>
            <p className="text-xs text-slate-500">
              All prices in USD. Save 17% with annual billing.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
