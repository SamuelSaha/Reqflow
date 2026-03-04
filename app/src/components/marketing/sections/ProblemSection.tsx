'use client';

/**
 * Problem Section - Before/After asymmetric layout
 * Shows pain points vs. Reqflow solution
 * Design: Diagonal split with contrasting colors
 */

import { X, Check, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const painPoints = [
  {
    problem: 'Lost in spreadsheets and Slack threads',
    solution: 'One connected record per tool'
  },
  {
    problem: 'No idea who owns what subscription',
    solution: 'Automatic ownership tracking from day 1'
  },
  {
    problem: 'Renewals surprise you every month',
    solution: 'Notice-window alerts with exit strategy'
  },
  {
    problem: 'Budget overruns discovered too late',
    solution: 'Real-time budget tracking + soft limits'
  }
];

const metrics = [
  { label: 'Hours saved per month', before: '0', after: '12+', unit: 'hrs' },
  { label: 'Duplicate tools caught', before: '0', after: '3-5', unit: 'tools' },
  { label: 'Average cost savings', before: '$0', after: '$8K+', unit: '/year' }
];

export function ProblemSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 bg-mkt-slate-50 overflow-hidden"
    >
      {/* Section heading */}
      <div className="section-container mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-display text-6xl text-mkt-deep mb-6 leading-tight">
            Procurement doesn't have to hurt
          </h2>
          <p className="text-body text-xl text-mkt-slate-600 leading-relaxed">
            Most teams waste 10-15 hours per month on procurement chaos.
            Here's what changes when you use Reqflow.
          </p>
        </div>
      </div>

      {/* Before/After comparison - Asymmetric layout */}
      <div className="section-container">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* BEFORE - 2 columns */}
          <div className="lg:col-span-2">
            <div
              className={`card-brutal bg-white border-mkt-error shadow-brutal p-8 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.1s' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-mkt-error/10 border-2 border-mkt-error">
                  <TrendingDown className="w-6 h-6 text-mkt-error" />
                </div>
                <h3 className="text-display text-3xl text-mkt-error">Before</h3>
              </div>

              <ul className="space-y-4">
                {painPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-3 text-mkt-slate-700 transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${0.2 + idx * 0.1}s` }}
                  >
                    <X className="w-5 h-5 text-mkt-error flex-shrink-0 mt-0.5" />
                    <span className="text-body leading-snug">{point.problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AFTER - 3 columns */}
          <div className="lg:col-span-3">
            <div
              className={`card-brutal bg-mkt-deep shadow-brutal-lg p-8 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.2s' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-mkt-success/20 border-2 border-mkt-success">
                  <TrendingUp className="w-6 h-6 text-mkt-success" />
                </div>
                <h3 className="text-display text-3xl text-mkt-success">With Reqflow</h3>
              </div>

              <ul className="space-y-4 mb-8">
                {painPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-3 text-mkt-slate-100 transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                    style={{ transitionDelay: `${0.3 + idx * 0.1}s` }}
                  >
                    <Check className="w-5 h-5 text-mkt-success flex-shrink-0 mt-0.5" />
                    <span className="text-body leading-snug">{point.solution}</span>
                  </li>
                ))}
              </ul>

              {/* Metrics - Horizontal cards */}
              <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t-2 border-mkt-slate-700">
                {metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className={`transition-all duration-500 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                    style={{ transitionDelay: `${0.6 + idx * 0.1}s` }}
                  >
                    <p className="text-xs text-mkt-slate-400 uppercase tracking-wide mb-2">
                      {metric.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-mkt-slate-500 line-through">
                        {metric.before}
                      </span>
                      <span className="text-2xl text-display text-mkt-accent">
                        {metric.after}
                      </span>
                      <span className="text-xs text-mkt-slate-400">{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative geometric element */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-mkt-accent opacity-5 blur-3xl pointer-events-none -translate-y-1/2" />
    </section>
  );
}
