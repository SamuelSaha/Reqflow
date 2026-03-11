/**
 * Problem Section — Before/After comparison with pain stats
 * SSR, static content
 */

import { TriangleAlert, X, Check } from 'lucide-react';

const beforeSteps = [
  'Someone drops a Slack message: "Can I buy this tool?"',
  'Founder replies three hours later: "Ask ops"',
  'Ops lead is buried in other work, sees it next day',
  'Nobody checks if you already pay for something similar',
  'Purchase happens on a shared card with no record',
  'Invoice shows up. Nobody remembers approving it.',
];

const afterSteps = [
  'Someone submits a request in Slack or a quick web form',
  'Reqflow flags duplicates and fills in the details automatically',
  'Request routes to the right person instantly',
  'Approver sees full context, approves with one click',
  'PO created. Spend logged. Audit trail saved.',
  'Done. Your spend is tracked in real time.',
];

export function ProblemSection() {
  return (
    <section className="bg-[var(--warm-50)] py-16 md:py-20 lg:py-24 px-6 md:px-12 lg:px-20 flex flex-col items-center gap-16">
      {/* Header */}
      <div className="max-w-[700px] flex flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-red-50 rounded-full px-3.5 py-1.5">
          <TriangleAlert className="w-3.5 h-3.5 text-red-600" />
          <span className="text-caption font-semibold text-red-600">The Problem</span>
        </div>

        <h2 className="text-h2 text-slate-900">
          Your team buys tools on a shared card and hopes someone is tracking it.
        </h2>

        <p className="text-body-lg text-slate-600 max-w-[620px]">
          You&apos;re not big enough for a procurement department, but you&apos;re too big to track
          everything in your head. Slack threads, shared cards, surprise renewals. Every
          founder&apos;s been there.
        </p>
      </div>

      {/* Before / After cards */}
      <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Without Reqflow */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
          <div className="inline-flex items-center gap-1.5 mb-4">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-3 h-3 text-red-600" />
            </div>
            <span className="text-caption font-semibold text-red-600">Without Reqflow</span>
          </div>
          <h3 className="text-h4 text-slate-900 mb-6">
            Approving a $20/month tool takes a week and three Slack threads
          </h3>
          <div className="flex flex-col gap-4">
            {beforeSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-caption font-semibold text-red-600">{i + 1}</span>
                </div>
                <span className="text-body-sm text-slate-600 pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* With Reqflow */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
          <div className="inline-flex items-center gap-1.5 mb-4">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-caption font-semibold text-green-600">With Reqflow</span>
          </div>
          <h3 className="text-h4 text-slate-900 mb-6">
            Same request gets approved in under 2 hours. Every single time.
          </h3>
          <div className="flex flex-col gap-4">
            {afterSteps.map((step, i) => {
              const isLast = i === afterSteps.length - 1;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-caption font-semibold text-green-600">{i + 1}</span>
                  </div>
                  <span
                    className={`text-body-sm pt-0.5 ${
                      isLast ? 'font-bold text-green-600' : 'text-slate-600'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
