'use client';

/**
 * Pricing Section - Refined Brutalism style
 * Design: Bold tier cards with clear differentiation
 */

import { useState } from 'react';
import { Check, Sparkles, Building2, Rocket } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Rocket,
    tagline: 'For small teams testing the waters',
    price: { monthly: 0, annual: 0 },
    description: 'Everything you need to get started. Free during early access.',
    features: [
      'Up to 10 team members',
      'Unlimited requests & approvals',
      'Smart intake with AI classification',
      'Slack + Teams integration',
      'Budget tracking (3 budgets)',
      'Renewal alerts',
      'Email support'
    ],
    cta: 'Start Free Trial',
    ctaHref: '/signup',
    highlighted: false,
    color: 'slate'
  },
  {
    id: 'team',
    name: 'Team',
    icon: Building2,
    tagline: 'For growing teams that need more',
    price: { monthly: 29, annual: 25 },
    description: 'Everything in Starter, plus advanced features and priority support.',
    features: [
      'Up to 50 team members',
      'Unlimited budgets',
      'Contract management + AI extraction',
      'Vendor database',
      'Advanced analytics & reporting',
      'Custom approval workflows',
      'QuickBooks + Xero integration',
      'Priority support (24h response)'
    ],
    cta: 'Start Free Trial',
    ctaHref: '/signup',
    highlighted: true,
    color: 'accent',
    badge: 'Most Popular'
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Sparkles,
    tagline: 'For teams that want everything',
    price: { monthly: 99, annual: 85 },
    description: 'Everything in Team, plus premium features and white-glove support.',
    features: [
      'Unlimited team members',
      'Case Builder (AI-powered business cases)',
      'Custom integrations',
      'API + webhooks',
      'SSO (SAML, OIDC)',
      'Audit logs + compliance reports',
      'Dedicated success manager',
      'White-glove onboarding'
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    highlighted: false,
    color: 'premium'
  }
];

export function PricingRefined() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const getColorClasses = (color: string) => {
    const colors = {
      slate: {
        bg: 'bg-mkt-slate-50',
        border: 'border-mkt-slate-700',
        text: 'text-mkt-slate-700',
        iconBg: 'bg-mkt-slate-700'
      },
      accent: {
        bg: 'bg-mkt-accent/5',
        border: 'border-mkt-accent',
        text: 'text-mkt-accent',
        iconBg: 'bg-mkt-accent'
      },
      premium: {
        bg: 'bg-mkt-premium/5',
        border: 'border-mkt-premium',
        text: 'text-mkt-premium',
        iconBg: 'bg-mkt-premium'
      }
    };
    return colors[color as keyof typeof colors] || colors.slate;
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="section-container">
        {/* Section heading */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-display text-6xl text-mkt-deep mb-6 leading-tight">
            Transparent pricing.<br />
            No surprises.
          </h2>
          <p className="text-body text-xl text-mkt-slate-600 leading-relaxed mb-8">
            Free during early access. When we launch, pricing will be simple and fair.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-4 bg-mkt-slate-100 p-2 border-2 border-mkt-deep">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 text-body-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-mkt-deep text-white'
                  : 'text-mkt-slate-600 hover:text-mkt-deep'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 text-body-bold transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-mkt-deep text-white'
                  : 'text-mkt-slate-600 hover:text-mkt-deep'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-mkt-accent text-white text-xs px-2 py-0.5 font-bold">
                Save 15%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, idx) => {
            const Icon = tier.icon;
            const colors = getColorClasses(tier.color);
            const price = billingCycle === 'monthly' ? tier.price.monthly : tier.price.annual;

            return (
              <div
                key={tier.id}
                className={`card-brutal relative ${colors.bg} ${
                  tier.highlighted
                    ? 'border-4 shadow-brutal-xl scale-105'
                    : 'border-2 shadow-brutal-lg hover:shadow-brutal-xl'
                } ${colors.border} transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-mkt-accent text-white px-4 py-1 text-sm font-bold border-2 border-white whitespace-nowrap">
                    {tier.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`mb-4 flex items-center justify-center w-16 h-16 ${colors.iconBg} border-2 border-white`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Tier name */}
                <h3 className="text-display text-3xl text-mkt-deep mb-2">
                  {tier.name}
                </h3>

                {/* Tagline */}
                <p className={`text-body-bold ${colors.text} mb-4`}>
                  {tier.tagline}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-display text-5xl text-mkt-deep">
                      ${price}
                    </span>
                    <span className="text-mkt-slate-600 text-lg">
                      /user/month
                    </span>
                  </div>
                  {billingCycle === 'annual' && tier.price.monthly > 0 && (
                    <p className="text-sm text-mkt-slate-500 mt-1">
                      Billed ${price * 12}/user/year
                    </p>
                  )}
                  {price === 0 && (
                    <p className="text-sm text-mkt-success mt-1 font-bold">
                      Free during early access
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-body text-mkt-slate-600 mb-6 leading-relaxed">
                  {tier.description}
                </p>

                {/* CTA */}
                <Link
                  href={tier.ctaHref}
                  className={`block text-center py-4 px-6 text-body-bold text-lg mb-8 transition-all hover:-translate-x-1 hover:-translate-y-1 ${
                    tier.highlighted
                      ? 'bg-mkt-accent text-white border-2 border-mkt-deep shadow-brutal hover:shadow-brutal-md'
                      : 'bg-white text-mkt-deep border-2 border-mkt-deep shadow-brutal hover:shadow-brutal-md'
                  }`}
                >
                  {tier.cta}
                </Link>

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.text}`} />
                      <span className="text-body text-mkt-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* FAQ link */}
        <div className="mt-16 text-center">
          <p className="text-body text-mkt-slate-600">
            Have questions about pricing?{' '}
            <Link href="#faq" className="text-mkt-accent underline font-bold hover:text-mkt-accent-dark">
              Check our FAQ
            </Link>
            {' '}or{' '}
            <Link href="/contact" className="text-mkt-accent underline font-bold hover:text-mkt-accent-dark">
              contact sales
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-mkt-accent opacity-5 blur-3xl pointer-events-none" />
    </section>
  );
}
