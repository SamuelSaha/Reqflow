import {
  ArrowRight,
  Play,
  Lock,
  LayoutDashboard,
  FilePlus,
  CircleCheck,
  Wallet,
  Building2,
  FileText,
  TrendingDown,
  Plus,
  TriangleAlert,
  X,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */
export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-white via-[#F8FBFF] to-[#F0F6FF] pt-20 pb-[60px] px-20 flex flex-col items-center gap-12">
      {/* Hero Content - Clean & Minimal */}
      <div className="max-w-[900px] flex flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-[13px] font-medium text-slate-700">
            Free during early access. No card needed.
          </span>
        </div>

        <h1 className="text-[64px] font-extrabold leading-[1.1] tracking-[-2px] text-slate-900">
          Procurement for teams
          <br />
          that move too fast for spreadsheets.
        </h1>

        <p className="max-w-[680px] text-[20px] leading-relaxed text-slate-600">
          Reqflow gives small teams a real purchasing workflow. Free to use,
          ready in minutes, and built to replace the Slack threads your ops lead
          is drowning in.
        </p>

        <div className="flex gap-4">
          <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started Free
            <ArrowRight className="w-[18px] h-[18px]" />
          </button>
          <button className="inline-flex items-center gap-2 border border-slate-300 bg-white px-7 py-3 rounded-lg font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
            Watch Demo
            <Play className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Product Mockup - Subtle Shadow */}
      <div className="w-[1100px] h-[620px] rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] overflow-hidden bg-white border border-slate-200">
        <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-[10px] h-[10px] bg-red-500 rounded-full" />
            <span className="w-[10px] h-[10px] bg-amber-500 rounded-full" />
            <span className="w-[10px] h-[10px] bg-green-500 rounded-full" />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-md h-7 px-3">
            <Lock className="w-3 h-3 text-slate-400" />
            <span className="text-[12px] text-slate-400">
              app.reqflow.com/dashboard
            </span>
          </div>
          <div className="w-[52px]" />
        </div>

        <div className="flex h-[calc(100%-44px)]">
          {/* Sidebar */}
          <div className="w-[220px] bg-white border-r border-slate-200 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 pb-4 mb-1">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[15px] font-bold text-slate-900">
                Reqflow
              </span>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-50 rounded-lg">
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span className="text-[13px] font-semibold text-blue-600">
                Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
              <FilePlus className="w-4 h-4 text-slate-600" />
              <span className="text-[13px] font-medium text-slate-600">
                Requests
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
              <CircleCheck className="w-4 h-4 text-slate-600" />
              <span className="text-[13px] font-medium text-slate-600">
                Approvals
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
              <Wallet className="w-4 h-4 text-slate-600" />
              <span className="text-[13px] font-medium text-slate-600">
                Budgets
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span className="text-[13px] font-medium text-slate-600">
                Vendors
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="text-[13px] font-medium text-slate-600">
                Invoices
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-slate-50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-slate-900">Dashboard</h2>
              <button className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-[13px] font-semibold">
                <Plus className="w-3.5 h-3.5" />
                New Request
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-[24px] font-bold text-slate-900 mb-1">
                  &euro;127K
                </div>
                <div className="text-[12px] font-medium text-slate-600 mb-2">
                  Monthly Spend
                </div>
                <div className="inline-flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-green-600" />
                  <span className="text-[11px] font-medium text-green-600">
                    -12%
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-[24px] font-bold text-slate-900 mb-1">
                  3.2h
                </div>
                <div className="text-[12px] font-medium text-slate-600 mb-2">
                  Avg. Approval Time
                </div>
                <div className="inline-flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-green-600" />
                  <span className="text-[11px] font-medium text-green-600">
                    -40%
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-[24px] font-bold text-slate-900 mb-1">
                  94%
                </div>
                <div className="text-[12px] font-medium text-slate-600">
                  Budget Compliance
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center">
                <span className="text-[11px] font-semibold text-slate-500 w-[200px]">
                  REQUEST
                </span>
                <span className="text-[11px] font-semibold text-slate-500 w-[140px]">
                  VENDOR
                </span>
                <span className="text-[11px] font-semibold text-slate-500 w-[100px]">
                  AMOUNT
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex-1">
                  STATUS
                </span>
              </div>
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center">
                <span className="text-[13px] font-medium text-slate-900 w-[200px]">
                  GitHub Copilot
                </span>
                <span className="text-[13px] text-slate-600 w-[140px]">
                  GitHub
                </span>
                <span className="text-[13px] font-medium text-slate-900 w-[100px]">
                  &euro;2,736/yr
                </span>
                <span className="inline-flex px-2.5 py-1 bg-green-100 text-green-800 text-[11px] font-semibold rounded-full">
                  Approved
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center">
                <span className="text-[13px] font-medium text-slate-900 w-[200px]">
                  Figma Enterprise
                </span>
                <span className="text-[13px] text-slate-600 w-[140px]">
                  Figma
                </span>
                <span className="text-[13px] font-medium text-slate-900 w-[100px]">
                  &euro;8,400/yr
                </span>
                <span className="inline-flex px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-semibold rounded-full">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust Logos                                                         */
/* ------------------------------------------------------------------ */
export function TrustLogos() {
  const logos = ["Doctolib", "Qonto", "Alan", "Pennylane", "Swile", "Spendesk"];

  return (
    <section className="bg-white py-10 px-20 flex flex-col items-center gap-6">
      <span className="text-[12px] font-semibold text-slate-400 tracking-[1.5px] uppercase">
        BUILT FOR FAST-MOVING TEAMS WHO BUY WITHOUT A PROCUREMENT DEPARTMENT
      </span>
      <div className="flex items-center justify-center gap-16">
        {logos.map((name) => (
          <span
            key={name}
            className="text-[18px] font-bold text-slate-300 select-none"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Problem Section                                                    */
/* ------------------------------------------------------------------ */

const beforeSteps = [
  'Someone drops a Slack message: "Can I buy this tool?"',
  'Founder replies three hours later: "Ask ops"',
  "Ops lead is buried in other work, sees it next day",
  "Nobody checks if the team already pays for something similar",
  "Purchase happens on a shared card with no record",
  "Invoice shows up. Nobody remembers approving it.",
];

const afterSteps = [
  "Team member submits a request in Slack or a quick web form",
  "Reqflow flags duplicates and fills in the details automatically",
  "Request routes to the right person on your team instantly",
  "Approver sees full context, approves with one click",
  "PO created. Spend logged. Audit trail saved.",
  "Done. Your team's spend is tracked in real time.",
];

const painStats = [
  { value: "40-60%", label: "of purchases bypass any formal process" },
  { value: "29%", label: "of SaaS subscriptions overlap or duplicate" },
  { value: "8.3 hrs", label: "per week lost to manual procurement tasks" },
  { value: "$15-40", label: "cost to process one invoice manually" },
];

export function ProblemSection() {
  return (
    <section className="bg-gradient-to-b from-white via-slate-50 to-white p-20 flex flex-col items-center gap-16">
      <div className="max-w-[700px] flex flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-red-50 rounded-full px-3.5 py-1.5">
          <TriangleAlert className="w-3.5 h-3.5 text-red-600" />
          <span className="text-[13px] font-semibold text-red-600">
            The Problem
          </span>
        </div>

        <h2 className="text-[44px] font-bold leading-[1.15] tracking-tight text-slate-900">
          Your team buys tools on a shared card and hopes someone is tracking it.
        </h2>

        <p className="text-[18px] leading-relaxed text-slate-600 max-w-[620px]">
          No procurement team. No formal process. Just Slack messages, a shared
          credit card, and a founder who finds surprise charges every month.
          Sound familiar?
        </p>
      </div>

      <div className="max-w-[1200px] w-full grid grid-cols-2 gap-8">
        {/* Before */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
          <div className="inline-flex items-center gap-1.5 mb-4">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-3 h-3 text-red-600" />
            </div>
            <span className="text-[13px] font-semibold text-red-600">
              Without Reqflow
            </span>
          </div>
          <h3 className="text-[22px] font-bold text-slate-900 mb-6">
            A week to approve a $200 tool for a 20-person team
          </h3>
          <div className="flex flex-col gap-4">
            {beforeSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-semibold text-red-600">
                    {i + 1}
                  </span>
                </div>
                <span className="text-[15px] leading-relaxed text-slate-600 pt-0.5">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* After */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md">
          <div className="inline-flex items-center gap-1.5 mb-4">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-[13px] font-semibold text-green-600">
              With Reqflow
            </span>
          </div>
          <h3 className="text-[22px] font-bold text-slate-900 mb-6">
            Under 2 hours. Every time. Zero confusion.
          </h3>
          <div className="flex flex-col gap-4">
            {afterSteps.map((step, i) => {
              const isLast = i === afterSteps.length - 1;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-semibold text-green-600">
                      {i + 1}
                    </span>
                  </div>
                  <span
                    className={`text-[15px] leading-relaxed pt-0.5 ${
                      isLast ? "font-bold text-green-600" : "text-slate-600"
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

      <div className="max-w-[1200px] w-full grid grid-cols-4 gap-6">
        {painStats.map((stat) => (
          <div
            key={stat.value}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-md hover:shadow-lg transition-shadow flex flex-col items-center gap-2"
          >
            <span className="text-[28px] font-bold text-red-600 tracking-tight">
              {stat.value}
            </span>
            <span className="text-[13px] font-medium text-slate-600 text-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
