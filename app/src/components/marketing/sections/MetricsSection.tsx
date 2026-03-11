/**
 * Metrics Section — Measured outcomes
 * SSR, ported from original MeasuredOutcomes.tsx
 */

import { TrendingUp } from 'lucide-react';

const outcomes = [
  {
    value: '<30min',
    title: 'Average time to get approval',
    subtitle: 'No more Slack threads and lost emails',
  },
  {
    value: '100%',
    title: 'Purchases tracked in one place',
    subtitle: 'From day one, not month three',
  },
  {
    value: '5x',
    title: 'Faster audit prep',
    subtitle: 'Everything is already logged',
  },
  {
    value: 'Zero',
    title: 'Surprise charges at quarter end',
    subtitle: 'Real-time visibility into every dollar',
  },
];

export function MetricsSection() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Badge + Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 mb-5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-caption font-semibold text-blue-600 uppercase tracking-wider">
              Measured Outcomes
            </span>
          </div>
          <h2 className="text-h2 text-slate-900">
            What happens when buying
            <br />
            stops being a mess.
          </h2>
        </div>

        {/* Outcome Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {outcomes.map((outcome, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="text-5xl md:text-6xl font-bold text-blue-600 mb-4">
                {outcome.value}
              </div>
              <div className="text-body font-semibold text-slate-900 mb-1">{outcome.title}</div>
              <div className="text-body-sm text-slate-500">{outcome.subtitle}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
