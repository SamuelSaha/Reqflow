/**
 * Final CTA — Dark section with dual CTAs
 * SSR
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="bg-slate-900 py-16 md:py-20 lg:py-24 px-6 md:px-12 lg:px-20 flex flex-col items-center gap-8">
      <h2 className="text-h2 text-white text-center max-w-[700px] whitespace-pre-line">
        {'Stop buying things\nover Slack.'}
      </h2>

      <p className="text-body-lg text-slate-400 text-center max-w-[600px]">
        Reqflow gives you a real procurement workflow. Free during early access. No credit card, no
        limits.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-body font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started Free
          <ArrowRight className="w-[18px] h-[18px]" />
        </Link>
        <Link
          href="/features"
          className="inline-flex items-center gap-2 border border-slate-700 text-white px-8 py-3.5 rounded-2xl text-body font-medium hover:bg-slate-800 transition-colors"
        >
          See How It Works
        </Link>
      </div>

      <p className="text-body-sm font-medium text-slate-500">
        100% free &nbsp;&middot;&nbsp; No card required &nbsp;&middot;&nbsp; Live in under 10
        minutes
      </p>
    </section>
  );
}
