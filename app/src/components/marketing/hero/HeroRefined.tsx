/**
 * Hero Section — Warm gradient with product showcase
 * SSR for optimal LCP. Zero animation delays above fold.
 */

import {
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  TrendingDown,
} from 'lucide-react';
import { PrimaryCta, SecondaryCta, CtaGroup } from '@/components/ui/cta-button';

export function HeroRefined() {
  return (
    <section className="relative overflow-hidden bg-[var(--warm-50)]">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* ─── Hero Content ─── */}
        <div className="flex flex-col items-center py-16 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 gap-6 md:gap-7 text-center max-w-4xl mx-auto w-full">
            {/* Trust Badge */}
            <div className="flex justify-center">
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60"
                role="status"
                aria-label="Free early access - No credit card required"
              >
                <Sparkles className="w-4 h-4 text-green-600" strokeWidth={2} />
                <span className="text-body-sm font-medium text-green-900">
                  Free during early access
                </span>
                <span className="text-body-sm text-green-400" aria-hidden="true">
                  •
                </span>
                <span className="text-body-sm text-green-700">No credit card required</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-hero text-slate-900 leading-[1.1]">
              Procurement for teams that move too fast for spreadsheets
            </h1>

            {/* Subheadline */}
            <p className="text-body-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Reqflow gives you a real purchasing workflow. Free to use, ready in minutes, and built
              to replace the Slack threads your ops lead is drowning in.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2} />
                <span className="text-slate-700 font-medium">2-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" strokeWidth={2} />
                <span className="text-slate-700 font-medium">Approve in under 2 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" strokeWidth={2} />
                <span className="text-slate-700 font-medium">94% budget compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" strokeWidth={2} />
                <span className="text-slate-700 font-medium">Zero missed renewals</span>
              </div>
            </div>

            {/* CTAs */}
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
          </div>
        </div>

        {/* ─── Dashboard Mockup ─── */}
        <div className="pb-12 md:pb-16 lg:pb-20">
          <div className="relative max-w-6xl mx-auto">
            {/* Glow behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-transparent blur-3xl -z-10 scale-150" />

            <div className="relative rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80 bg-white">
              {/* Browser chrome */}
              <div className="h-10 md:h-12 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 px-3 md:px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full" />
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-amber-400 rounded-full" />
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full" />
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg h-7 md:h-8 px-3 md:px-4">
                  <Shield className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-600" />
                  <span className="text-[11px] md:text-caption font-medium text-slate-600">
                    app.reqflow.com/dashboard
                  </span>
                </div>
                <div className="w-[48px] md:w-[68px]" />
              </div>

              {/* Dashboard content */}
              <div className="bg-gradient-to-br from-slate-50 to-white p-4 md:p-6 lg:p-8">
                {/* Metric cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6 lg:mb-8">
                  <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-0.5 md:mb-1">
                          $127K
                        </div>
                        <div className="text-caption md:text-body-sm font-medium text-slate-600">
                          Monthly Spend
                        </div>
                      </div>
                      <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg">
                        <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-[11px] md:text-caption font-semibold text-green-600">
                      ↓ 12% vs last month
                    </div>
                  </div>

                  <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-0.5 md:mb-1">
                          3.2h
                        </div>
                        <div className="text-caption md:text-body-sm font-medium text-slate-600">
                          Avg. Approval Time
                        </div>
                      </div>
                      <div className="p-1.5 md:p-2 bg-amber-50 rounded-lg">
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="text-[11px] md:text-caption font-semibold text-green-600">
                      ↓ 40% improvement
                    </div>
                  </div>

                  <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-0.5 md:mb-1">
                          94%
                        </div>
                        <div className="text-caption md:text-body-sm font-medium text-slate-600">
                          Budget Compliance
                        </div>
                      </div>
                      <div className="p-1.5 md:p-2 bg-green-50 rounded-lg">
                        <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="text-[11px] md:text-caption font-semibold text-green-600">
                      ✓ On target
                    </div>
                  </div>
                </div>

                {/* Recent Requests table */}
                <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="text-body-sm md:text-body font-semibold text-slate-900">
                      Recent Requests
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
                      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs md:text-sm flex-shrink-0">
                          GH
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-body-sm md:text-body truncate">
                            GitHub Copilot
                          </div>
                          <div className="text-caption md:text-body-sm text-slate-600 truncate">
                            GitHub • Engineering
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-semibold text-slate-900 text-body-sm md:text-body">
                            $2.7K/yr
                          </div>
                          <div className="text-[10px] md:text-caption text-slate-600">20 seats</div>
                        </div>
                        <span className="px-2 md:px-3 py-1 bg-green-100 text-green-800 text-[10px] md:text-caption font-semibold rounded-full whitespace-nowrap">
                          Approved
                        </span>
                      </div>
                    </div>
                    <div className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
                      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs md:text-sm flex-shrink-0">
                          FG
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-body-sm md:text-body truncate">
                            Figma Enterprise
                          </div>
                          <div className="text-caption md:text-body-sm text-slate-600 truncate">
                            Figma • Design
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-semibold text-slate-900 text-body-sm md:text-body">
                            $8.4K/yr
                          </div>
                          <div className="text-[10px] md:text-caption text-slate-600">15 seats</div>
                        </div>
                        <span className="px-2 md:px-3 py-1 bg-amber-100 text-amber-800 text-[10px] md:text-caption font-semibold rounded-full whitespace-nowrap">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-16 md:h-20 lg:h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
