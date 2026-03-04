'use client';

/**
 * Hero CTA - Client component for analytics tracking
 * Brutal button design with hover lift effect
 */

import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { useState } from 'react';

export function HeroCTA() {
  const [primaryHovered, setPrimaryHovered] = useState(false);

  const handlePrimaryClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'CTA',
        event_label: 'hero_primary_signup',
        value: 1
      });
    }
  };

  const handleSecondaryClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'CTA',
        event_label: 'hero_secondary_demo',
        value: 0.5
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Primary CTA */}
      <Link
        href="/signup"
        onClick={handlePrimaryClick}
        onMouseEnter={() => setPrimaryHovered(true)}
        onMouseLeave={() => setPrimaryHovered(false)}
        className="group relative inline-flex items-center justify-center gap-3 px-8 py-5 text-body-bold text-lg bg-mkt-accent text-white border-2 border-mkt-deep shadow-brutal-md hover:shadow-brutal-lg transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-mkt-accent/50 focus:ring-offset-4 focus:ring-offset-mkt-deep"
      >
        <span className="relative z-10">Start Free Trial</span>
        <ArrowRight
          className={`w-5 h-5 transition-transform duration-200 ${
            primaryHovered ? 'translate-x-1' : ''
          }`}
        />

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-mkt-accent-light to-mkt-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
      </Link>

      {/* Secondary CTA */}
      <Link
        href="/contact"
        onClick={handleSecondaryClick}
        className="group inline-flex items-center justify-center gap-3 px-8 py-5 text-body-bold text-lg bg-mkt-slate-50 text-mkt-deep border-2 border-mkt-deep shadow-brutal-md hover:shadow-brutal-lg transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:bg-white focus:outline-none focus:ring-4 focus:ring-mkt-slate-400/50 focus:ring-offset-4 focus:ring-offset-mkt-deep"
      >
        <Calendar className="w-5 h-5" />
        <span>Book a Demo</span>
      </Link>
    </div>
  );
}
