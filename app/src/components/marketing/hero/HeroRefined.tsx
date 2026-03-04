/**
 * Hero Section - Improved UX with existing brand
 * Server-side rendered for optimal LCP
 * Design: Clean layout, existing Manrope font, slate/blue palette
 */

import { Zap, Shield } from 'lucide-react';
import { HeroBackground } from './HeroBackground';
import { HeroCTA } from './HeroCTA';

export function HeroRefined() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-mkt-deep">
      {/* Background gradient glow */}
      <HeroBackground />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise-overlay opacity-20" />

      {/* Content */}
      <div className="relative z-10 section-container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow - Small context */}
          <div className="mb-6 flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="h-px w-12 bg-mkt-accent" />
            <p className="text-sm text-mkt-slate-400 uppercase tracking-wider font-medium">
              Built for 5-50 person teams
            </p>
            <div className="h-px w-12 bg-mkt-accent" />
          </div>

          {/* Main headline - Using existing brand headline and Manrope font */}
          <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            The connected procurement workflow for small teams
          </h1>

          {/* Subheadline - Clear value prop */}
          <p
            className="text-xl md:text-2xl text-mkt-slate-300 leading-relaxed max-w-3xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            Track SaaS spend, catch duplicates, never miss renewals. Everything you need to manage procurement—without the enterprise bloat.
          </p>

          {/* CTA Group - Client component for analytics */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <HeroCTA />
          </div>

          {/* Trust signals - Brutally simple */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-mkt-slate-400 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-mkt-accent" />
              <span className="text-body-bold text-sm">Free during early access</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-mkt-slate-700" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-mkt-accent" />
              <span className="text-body-bold text-sm">GDPR compliant, EU hosted</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-mkt-slate-700" />
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-mkt-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-body-bold text-sm">No credit card required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geometric accent - bottom right */}
      <div
        className="absolute bottom-0 right-0 w-64 h-64 bg-mkt-accent opacity-5 blur-3xl pointer-events-none animate-pulse-slow"
        style={{ animationDelay: '0.6s' }}
      />

      {/* Geometric accent - top left */}
      <div
        className="absolute top-0 left-0 w-96 h-96 bg-mkt-premium opacity-5 blur-3xl pointer-events-none animate-pulse-slow"
        style={{ animationDelay: '0.8s' }}
      />
    </section>
  );
}
