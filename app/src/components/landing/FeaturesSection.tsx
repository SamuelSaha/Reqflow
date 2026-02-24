import {
  Zap,
  Check,
  Sparkles,
  ArrowRight,
  Users,
  ChartPie,
  Bell,
  ShieldCheck,
  Eye,
  MessageSquare,
  Settings,
  Lock,
  BarChart,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Core Features Section                                              */
/* ------------------------------------------------------------------ */
export function CoreFeatures() {
  return (
    <section className="bg-gradient-to-b from-white via-slate-50/50 to-blue-50 p-20 flex flex-col items-center gap-16">
      {/* Header */}
      <div className="max-w-[700px] text-center flex flex-col items-center gap-4">
        <div className="bg-blue-50 rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[13px] font-semibold text-blue-600">
            How It Works
          </span>
        </div>
        <h2 className="text-[44px] font-bold leading-[1.15] tracking-tight text-slate-900">
          Every purchase request tracked,
          <br />
          approved, and paid. Automatically.
        </h2>
        <p className="text-[18px] leading-relaxed text-slate-600 max-w-[620px]">
          Reqflow replaces scattered requests and manual follow-ups with a
          structured procurement process that runs in minutes, not days.
        </p>
      </div>

      {/* Feature 1 - Smart Intake */}
      <div className="max-w-[1200px] flex gap-12 items-center">
        <div className="flex-1 flex flex-col gap-5">
          <span className="bg-blue-50 rounded-md px-3 py-1 text-[11px] font-bold text-blue-600 tracking-wide w-fit">
            STEP 1
          </span>
          <h3 className="text-[28px] font-bold tracking-tight text-slate-900">
            Smart Intake: One Entry Point
          </h3>
          <p className="text-[16px] leading-relaxed text-slate-600">
            Submit requests from Slack, email, or browser. The AI-powered form
            detects categories, flags duplicates against existing subscriptions,
            and validates budget so requests arrive complete on the first try.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              "Adaptive forms that surface only relevant fields",
              "Automatic duplicate detection across subscriptions",
              "Works in Slack, Teams, email, and browser",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-[14px] font-medium text-slate-600">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[520px] h-[380px] bg-white rounded-xl border border-slate-200 shadow-lg p-5 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">
              New Purchase Request
            </span>
            <span className="bg-green-50 text-green-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              AI Filling
            </span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-[11px] text-blue-600 leading-relaxed">
              Detected: SaaS &middot; Developer Tools &middot; $19/user/mo
              <br />
              Your company already has GitHub Enterprise.
            </span>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-500">
                What do you need?
              </label>
              <div className="border border-slate-200 rounded-md px-3 py-1.5 text-[12px] text-slate-900">
                GitHub Copilot Business for 12 engineers
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-500">
                  Category
                </label>
                <div className="border border-slate-200 rounded-md px-3 py-1.5 text-[12px] text-slate-900 flex items-center justify-between">
                  <span>Dev Tools (AI-filled)</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 rotate-90" />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-500">
                  Est. Cost
                </label>
                <div className="border border-slate-200 rounded-md px-3 py-1.5 text-[12px] text-slate-900 flex items-center justify-between">
                  <span>$228/mo (AI-filled)</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 rotate-90" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[11px] font-medium text-slate-500">
                Business Justification
              </label>
              <div className="border border-slate-200 rounded-md px-3 py-1.5 text-[12px] text-slate-400 flex-1">
                Explain why this purchase is needed...
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button className="border border-slate-200 rounded-md px-3 py-1.5 text-[12px] font-medium text-slate-600">
              Save Draft
            </button>
            <button className="bg-blue-600 rounded-md px-3 py-1.5 text-[12px] font-medium text-white flex items-center gap-1">
              Submit Request
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature 2 - Approval Workflows (reversed layout) */}
      <div className="max-w-[1200px] flex gap-12 items-center">
        <div className="w-[520px] h-[380px] bg-white rounded-xl border border-slate-200 shadow-lg p-5 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Approval Chain</span>
            <span className="bg-amber-50 text-amber-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              2 of 3 Approved
            </span>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-[12px] font-bold">
              MD
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-slate-900">
                Marc Dubois &middot; Engineering
              </span>
              <span className="text-[11px] text-slate-500">
                GitHub Copilot Business &middot; &euro;2,736/yr
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-slate-900">
                  Sarah Chen &middot; Eng Lead
                </span>
                <span className="text-[11px] text-slate-500">
                  Approved 20 min ago
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-slate-900">
                  Claire Dupont &middot; Head of Finance
                </span>
                <span className="text-[11px] text-slate-500">
                  Approved 45 min ago
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-slate-900">
                  IT Security Review
                </span>
                <span className="text-[11px] text-slate-500">
                  Waiting &middot; Auto-escalate in 23h
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">
                Budget Impact
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                65% used
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: "65%" }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5">
          <span className="bg-blue-50 rounded-md px-3 py-1 text-[11px] font-bold text-blue-600 tracking-wide w-fit">
            STEP 2
          </span>
          <h3 className="text-[28px] font-bold tracking-tight text-slate-900">
            Approval Workflows That Route Themselves
          </h3>
          <p className="text-[16px] leading-relaxed text-slate-600">
            A visual workflow builder routes each request to the right approver
            with full context: budget impact, purchase history, and similar
            orders. Approvers act in one click from wherever they work.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              "Conditional multi-level approval chains",
              "Auto-delegation and escalation when approvers are out",
              "One-click approval from email, Slack, or mobile",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-[14px] font-medium text-slate-600">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature 3 - Budget Tracking */}
      <div className="max-w-[1200px] flex gap-12 items-center">
        <div className="flex-1 flex flex-col gap-5">
          <span className="bg-blue-50 rounded-md px-3 py-1 text-[11px] font-bold text-blue-600 tracking-wide w-fit">
            STEP 3
          </span>
          <h3 className="text-[28px] font-bold tracking-tight text-slate-900">
            Live Budget Tracking &amp; Enforcement
          </h3>
          <p className="text-[16px] leading-relaxed text-slate-600">
            Departments see available budget before they even request. Hard stops
            prevent overspend automatically, while AI forecasting surfaces
            anomalies and trends before they become problems.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              "Hierarchical budgets by department, project, and category",
              "Soft warnings at 80%, hard stops at 100%",
              "AI spend forecasting and anomaly alerts",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-[14px] font-medium text-slate-600">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[520px] h-[380px] bg-white rounded-xl border border-slate-200 shadow-lg p-5 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Budget Overview</span>
            <span className="text-[11px] font-medium text-slate-500">
              Q1 2025
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[22px] font-bold text-slate-900">
                &euro;495K{" "}
                <span className="text-[13px] font-normal text-slate-500">
                  of &euro;650K
                </span>
              </span>
              <span className="text-[12px] font-semibold text-amber-600">
                76% consumed
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: "76%" }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {[
              { name: "Product", pct: 68, color: "green" },
              { name: "Marketing", pct: 92, color: "red", alert: true },
              { name: "Infrastructure", pct: 54, color: "green" },
              { name: "Operations", pct: 81, color: "amber" },
            ].map(({ name, pct, color, alert }) => (
              <div key={name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-slate-700 flex items-center gap-1.5">
                    {name}
                    {alert && (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    )}
                  </span>
                  <span
                    className={`text-[11px] font-medium text-${color}-600`}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${color}-500 rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Persona Section                                                    */
/* ------------------------------------------------------------------ */
export function PersonaSection() {
  return (
    <section className="bg-gradient-to-b from-white via-slate-50/40 to-blue-50 py-20 px-[120px] flex flex-col gap-16">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="bg-blue-50 rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[12px] font-semibold text-blue-600 tracking-wide">
            BUILT FOR SMALL TEAMS
          </span>
        </div>
        <h2 className="text-[44px] font-bold leading-[1.15] tracking-tight text-slate-900">
          One tool for everyone
          <br />
          wearing multiple hats.
        </h2>
        <p className="text-[18px] leading-relaxed text-slate-600 max-w-[600px]">
          Whether you handle finances, ship code, or keep operations running,
          Reqflow gives you a view shaped around your decisions.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Claire */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
          <div className="p-7 pb-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-[14px] font-bold">
                CD
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-slate-900">
                  Claire D.
                </span>
                <span className="text-[13px] text-slate-500">
                  Founder &amp; COO
                </span>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-slate-600 italic">
              &ldquo;I need to see where every dollar goes without chasing
              receipts across a dozen channels.&rdquo;
            </p>
          </div>
          <div className="bg-slate-50 px-7 py-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <ChartPie className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">
                Real-time budget dashboards
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">
                Overspend alerts by project
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">
                Full compliance audit trail
              </span>
            </div>
          </div>
        </div>

        {/* Marc */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
          <div className="p-7 pb-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-[14px] font-bold">
                MD
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-slate-900">
                  Marc D.
                </span>
                <span className="text-[13px] text-slate-500">
                  Engineering Lead
                </span>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-slate-600 italic">
              &ldquo;I just want to buy what my team needs without a 3-page form
              and a two-week wait.&rdquo;
            </p>
          </div>
          <div className="bg-slate-50 px-7 py-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">
                2-minute smart request form
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">
                Live approval status tracking
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">
                Slack &amp; Teams notifications
              </span>
            </div>
          </div>
        </div>

        {/* Sophie */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
          <div className="p-7 pb-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center text-white text-[14px] font-bold">
                SL
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-slate-900">
                  Sophie L.
                </span>
                <span className="text-[13px] text-slate-500">Ops Manager</span>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-slate-600 italic">
              &ldquo;I need guardrails that enforce themselves, not ones I have
              to babysit.&rdquo;
            </p>
          </div>
          <div className="bg-slate-50 px-7 py-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">
                Configurable approval workflows
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">
                Policy engine with auto-enforcement
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">
                Vendor performance scoring
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
