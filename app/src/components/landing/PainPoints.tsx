"use client";

import { X, Check } from "lucide-react";

const withoutItems = [
  "Slack request disappears in the feed",
  "Finance asks who approved what",
  "Duplicate subscriptions pile up unnoticed",
  "Budget surprises at month-end",
  "No audit trail for compliance reviews",
];

const withItems = [
  "Submit request from Slack or browser in 30 seconds",
  "AI validates and routes to the right approver",
  "One-click approval with full budget context",
  "Automatic duplicate detection saves money",
  "Complete audit trail generated automatically",
];

export function PainPoints() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-h2 text-slate-900 mb-4">
            People buy tools on a shared card and you hope someone is tracking it.
          </h2>
          <p className="text-body-lg text-slate-600">
            No procurement department. No formal process. Just Slack messages, a shared
            credit card, and a founder who finds surprise charges every month.
            Sound familiar?
          </p>
        </div>

        {/* Before/After Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {/* WITHOUT Reqflow */}
          <div className="rounded-2xl border border-red-100 bg-red-50/40 p-8">
            <span className="text-caption font-semibold text-slate-500 uppercase tracking-wider">
              Without Reqflow
            </span>
            <h3 className="text-h4 text-red-700 font-bold mt-3 mb-6">
              A week to approve a $200 tool for a 20-person business
            </h3>
            <div className="space-y-3.5">
              {withoutItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-body text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WITH Reqflow */}
          <div className="rounded-2xl border border-green-100 bg-green-50/40 p-8">
            <span className="text-caption font-semibold text-slate-500 uppercase tracking-wider">
              With Reqflow
            </span>
            <h3 className="text-h4 text-green-700 font-bold mt-3 mb-6">
              Under 2 hours. Every time. Zero confusion.
            </h3>
            <div className="space-y-3.5">
              {withItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-body text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
