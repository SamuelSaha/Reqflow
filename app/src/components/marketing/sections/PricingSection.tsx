/**
 * Pricing Section — Early access single $0 card
 * SSR
 */

import Link from 'next/link';
import { CreditCard, Check, ArrowRight } from 'lucide-react';

const features = [
  'Unlimited users and requests',
  'Full approval workflows',
  'Budget tracking and purchase orders',
  'Slack, QuickBooks, Xero integrations',
  'AI copilot for spend analysis',
];

export function PricingSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 px-6 md:px-12 lg:px-20 flex flex-col items-center gap-16">
      {/* Header */}
      <div className="max-w-[700px] text-center flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 rounded-full px-3.5 py-1.5">
          <CreditCard className="text-blue-600" size={14} />
          <span className="text-caption text-blue-600">Early Access</span>
        </span>

        <h2 className="text-h2 text-slate-900">Free while we build this together.</h2>

        <p className="text-body-lg text-slate-600 max-w-[620px]">
          Reqflow is in early access. Everything is free for now. No credit card, no trial countdown,
          no limits. Use it, break it, tell us what&apos;s missing.
        </p>
      </div>

      {/* Pricing card */}
      <div className="w-full max-w-[800px]">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center gap-8 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="text-hero text-slate-900">$0</span>
            <span className="text-body-lg font-medium text-slate-600">
              Free during early access
            </span>
          </div>

          <div className="w-full h-px bg-slate-200" />

          <div className="w-full flex flex-col gap-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-body font-medium text-slate-600">{feature}</span>
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-slate-200" />

          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-12 py-3.5 rounded-xl text-body font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-[18px] h-[18px]" />
          </Link>

          <p className="text-body-sm font-medium text-slate-400 text-center">
            Paid plans will come later. Early users get locked-in pricing.
          </p>
        </div>
      </div>
    </section>
  );
}
