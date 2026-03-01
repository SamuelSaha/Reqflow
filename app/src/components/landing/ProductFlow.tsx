"use client";

import { FileText, GitBranch, BarChart3, ArrowRight, Check, AlertCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Step 01: Smart Intake - Form Preview UI                           */
/* ------------------------------------------------------------------ */
function IntakePreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h4 className="text-body font-semibold text-slate-900">New Purchase Request</h4>
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>4 of 4 fields</span>
        </div>
      </div>
      {/* Form Fields */}
      <div className="p-6 space-y-4">
        <div>
          <label className="text-caption text-slate-500 block mb-1.5">What do you need?</label>
          <div className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-body-sm text-slate-900">
            GitHub Copilot Business for 12 engineers
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-caption text-slate-500 block mb-1.5">Category</label>
            <div className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-body-sm text-slate-700 flex items-center justify-between">
              <span>Dev Tools</span>
              <span className="text-slate-400 text-xs">v</span>
            </div>
          </div>
          <div>
            <label className="text-caption text-slate-500 block mb-1.5">Budget</label>
            <div className="px-3 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-body-sm text-blue-700 font-medium">
              $2,700/yr
            </div>
          </div>
        </div>
        <div>
          <label className="text-caption text-slate-500 block mb-1.5">Business justification</label>
          <div className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-body-sm text-slate-600">
            Team productivity improvement - 15min/day/dev saves $180k+ in annual dev...
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <span className="text-body-sm text-slate-400">Save Draft</span>
          <button className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-body-sm font-medium">
            Submit Request
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 02: Approval Chain UI                                        */
/* ------------------------------------------------------------------ */
function ApprovalPreview() {
  const chain = [
    { name: "Nora Dubois", role: "Engineering", status: "approved", color: "bg-blue-500" },
    { name: "Sarah Chan", role: "Eng Lead", status: "approved", color: "bg-green-500" },
    { name: "Claire Dupont", role: "Head of Finance", status: "approved", color: "bg-amber-500" },
    { name: "IT Security Review", role: "Auto", status: "pending", color: "bg-slate-400" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h4 className="text-body font-semibold text-slate-900">Approval Chain</h4>
        <span className="text-caption text-green-600 font-medium">3 of 4 Approved</span>
      </div>
      <div className="p-6 space-y-4">
        {chain.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${step.color} flex items-center justify-center text-white text-xs font-bold`}>
              {step.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-body-sm font-medium text-slate-900">{step.name}</div>
              <div className="text-caption text-slate-500">{step.role}</div>
            </div>
            <span className={`text-caption font-medium ${step.status === "approved" ? "text-green-600" : "text-slate-400"}`}>
              {step.status === "approved" ? "Approved" : "Pending"}
            </span>
          </div>
        ))}
        {/* Budget impact bar */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption text-slate-500">Budget Impact</span>
            <span className="text-caption font-medium text-slate-900">89% used</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-red-400 rounded-full" style={{ width: "89%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 03: Budget Overview Chart UI                                 */
/* ------------------------------------------------------------------ */
function BudgetPreview() {
  const budgets = [
    { name: "Product", percent: 68, color: "bg-blue-600" },
    { name: "Marketing", percent: 82, color: "bg-green-500", warning: true },
    { name: "Infrastructure", percent: 45, color: "bg-slate-400" },
    { name: "Operations", percent: 23, color: "bg-slate-300" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h4 className="text-body font-semibold text-slate-900">Q1 Budget Overview</h4>
        <span className="text-caption text-slate-500">Jan - Mar 2026</span>
      </div>
      <div className="p-6">
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-h3 font-bold text-slate-900">€456K</span>
          <span className="text-body-sm text-slate-500">of €650K</span>
          <span className="ml-auto text-body-sm font-semibold text-blue-600">70%</span>
        </div>
        <div className="space-y-5">
          {budgets.map((b, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-body-sm text-slate-700">{b.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-body-sm font-medium text-slate-900">{b.percent}%</span>
                  {b.warning && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main ProductFlow Section                                          */
/* ------------------------------------------------------------------ */
export function ProductFlow() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-h2 text-slate-900 mb-4">
            Every purchase request tracked, approved, and paid. Automatically.
          </h2>
          <p className="text-body-lg text-slate-600">
            Reqflow replaces scattered requests and manual follow-ups with a structured
            procurement process that runs in minutes, not days.
          </p>
        </div>

        {/* Step 01 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <div>
            <span className="text-caption font-semibold text-slate-400 uppercase tracking-wider">Step 01</span>
            <h3 className="text-h3 text-slate-900 mt-2 mb-4">
              Smart Intake: One Entry Point
            </h3>
            <p className="text-body text-slate-600 mb-6 leading-relaxed">
              Submit requests from Slack, email, or browser. The AI-powered form detects
              categories, flags duplicates against existing subscriptions, and validates budget
              so requests arrive complete on the first try.
            </p>
            <ul className="space-y-2.5">
              {["Submit from Slack, email, or browser", "AI detects categories and flags duplicates", "Requests arrive complete on the first try"].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-body-sm text-slate-600">
                  <span className="text-slate-400"> - </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <IntakePreview />
        </div>

        {/* Step 02 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <div className="order-2 lg:order-1">
            <ApprovalPreview />
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-caption font-semibold text-slate-400 uppercase tracking-wider">Step 02</span>
            <h3 className="text-h3 text-slate-900 mt-2 mb-4">
              Approval Workflows That Route Themselves
            </h3>
            <p className="text-body text-slate-600 mb-6 leading-relaxed">
              A visual workflow builder routes each request to the right approver with full
              context: budget impact, purchase history, and similar orders. Approvers act in one
              click from wherever they work.
            </p>
            <ul className="space-y-2.5">
              {["Visual workflow builder for custom routing", "Full context: budget impact and purchase history", "One-click approval from Slack or email"].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-body-sm text-slate-600">
                  <span className="text-slate-400"> - </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Step 03 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-caption font-semibold text-slate-400 uppercase tracking-wider">Step 03</span>
            <h3 className="text-h3 text-slate-900 mt-2 mb-4">
              Live Budget Tracking & Enforcement
            </h3>
            <p className="text-body text-slate-600 mb-6 leading-relaxed">
              Your team sees remaining budget before they request. Hard stops prevent
              overspend automatically. AI-powered forecasting flags budgets trending toward
              zero before they get there.
            </p>
            <ul className="space-y-2.5">
              {["Real-time budget visibility before requesting", "Hard stops prevent overspend automatically", "AI forecasting flags budgets trending to zero"].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-body-sm text-slate-600">
                  <span className="text-slate-400"> - </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <BudgetPreview />
        </div>
      </div>
    </section>
  );
}
