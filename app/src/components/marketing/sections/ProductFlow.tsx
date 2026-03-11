/**
 * Product Flow — Alternating 3-step layout with UI mockups
 * Shows: Request -> Approve -> Track workflow
 * SSR for LCP, mockups are visual-only
 */

import {
  MessageSquare,
  CheckCircle,
  BarChart3,
  ArrowRight,
  Check,
  X,
  Clock,
  AlertTriangle,
  Shield,
} from 'lucide-react';

/* ─── Step 1 Mockup: Purchase Request Form ─── */
function RequestFormMockup() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <span className="text-sm font-semibold text-slate-900">New Purchase Request</span>
      </div>
      <div className="p-5 space-y-4">
        {/* Slack message origin */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-slate-900">Sarah</span>
              <span className="text-[10px] text-slate-400">via Slack</span>
            </div>
            <div className="mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700">
              /reqflow request Notion Team plan
            </div>
          </div>
        </div>

        {/* Auto-filled form */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Tool</span>
            <span className="font-semibold text-slate-900">Notion Team</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Category</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              Productivity
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Cost</span>
            <span className="font-semibold text-slate-900">$15/user/mo</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-700 font-medium">
              Similar to Confluence (already active)
            </span>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">
          Submit Request
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2 Mockup: Approval Chain ─── */
function ApprovalChainMockup() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Approval Request</span>
        <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" /> 23 min ago
        </span>
      </div>
      <div className="p-5 space-y-4">
        {/* Tool info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Notion Team</div>
            <div className="text-xs text-slate-500">
              Requested by Sarah (Ops) &middot; Productivity
            </div>
          </div>
        </div>

        {/* Budget bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500">Productivity Tools Budget</span>
            <span className="font-semibold text-slate-700">$480 / $2,000</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '24%' }} />
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">
            Within budget. Safe to approve.
          </p>
        </div>

        {/* Approval chain */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span className="text-xs text-slate-600">Ops Lead</span>
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-700">Founder</span>
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-xs text-slate-400">Finance</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
            <Check className="w-4 h-4" /> Approve
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">
            <X className="w-4 h-4" /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3 Mockup: Budget & Tracking Chart ─── */
function TrackingMockup() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Spend Dashboard</span>
        <span className="text-xs text-emerald-600 font-medium px-2 py-0.5 bg-emerald-50 rounded-full">
          Live
        </span>
      </div>
      <div className="p-5 space-y-4">
        {/* Mini chart bars */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Engineering</span>
              <span className="text-slate-900 font-semibold">$4,200 / $6,000</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Design</span>
              <span className="text-slate-900 font-semibold">$1,800 / $3,000</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Marketing</span>
              <span className="text-slate-900 font-semibold">$2,900 / $3,000</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '97%' }} />
            </div>
            <p className="text-[10px] text-amber-600 mt-0.5 font-medium">
              ⚠ Approaching limit
            </p>
          </div>
        </div>

        {/* Connected record chain */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Connected Record
          </span>
          <div className="mt-2 space-y-0">
            {[
              { label: 'Contract', value: 'notion-team-2025.pdf', color: 'bg-blue-500' },
              { label: 'Subscription', value: '12 seats · Annual', color: 'bg-violet-500' },
              { label: 'Next Invoice', value: 'Feb 15 · $2,160', color: 'bg-amber-500' },
              { label: 'Renewal', value: 'Jan 15 · 60-day notice', color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  {i < 3 && <div className="w-px h-4 bg-slate-200" />}
                </div>
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
                  <span className="text-[11px] font-semibold text-slate-700">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step data ─── */
const steps = [
  {
    number: '01',
    title: 'Request',
    headline: 'Submit from Slack or a quick form',
    description:
      'AI-powered intake that adapts to what you\'re buying. Duplicate detection happens before the request even reaches an approver.',
    bullets: [
      'Slack-native workflow, no context switching',
      'AI classifies tool type and fills details',
      'Flags duplicates and budget impact instantly',
    ],
    icon: MessageSquare,
    accent: 'blue',
    Mockup: RequestFormMockup,
  },
  {
    number: '02',
    title: 'Approve',
    headline: 'Route to the right person automatically',
    description:
      'Auto-approve small purchases. Route big ones based on budget, category, or amount. Approvers get full context in one click.',
    bullets: [
      'Auto-approve under $100/month',
      'Budget-based routing to the right approver',
      'One-click approve with full context',
    ],
    icon: CheckCircle,
    accent: 'emerald',
    Mockup: ApprovalChainMockup,
  },
  {
    number: '03',
    title: 'Track',
    headline: 'Every dollar tracked in real time',
    description:
      'From request to renewal, every tool gets one source of truth. Know what you own, what it costs, and when to renegotiate.',
    bullets: [
      'Contract → Subscription → Invoice linked',
      'Renewal alerts 60-90 days out',
      'Department budgets with live consumption',
    ],
    icon: BarChart3,
    accent: 'violet',
    Mockup: TrackingMockup,
  },
];

const accentColors: Record<string, string> = {
  blue: 'text-blue-600 bg-blue-50 border-blue-200',
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  violet: 'text-violet-600 bg-violet-50 border-violet-200',
};

const accentDots: Record<string, string> = {
  blue: 'bg-blue-600',
  emerald: 'bg-emerald-600',
  violet: 'bg-violet-600',
};

export function ProductFlow() {
  return (
    <section className="py-20 lg:py-28 bg-white px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
          <h2 className="text-h2 text-slate-900 mb-4">
            Every purchase request tracked, approved, and paid. Automatically.
          </h2>
          <p className="text-body-lg text-slate-600 max-w-2xl mx-auto">
            Three steps. Zero busywork. Reqflow connects every step so nothing falls through the
            cracks.
          </p>
        </div>

        {/* Alternating steps */}
        <div className="space-y-16 lg:space-y-24">
          {steps.map((step, i) => {
            const isReversed = i % 2 === 1;
            const { Mockup } = step;

            return (
              <div
                key={step.number}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  isReversed ? 'lg:direction-rtl' : ''
                }`}
              >
                {/* Text side */}
                <div className={isReversed ? 'lg:order-2' : 'lg:order-1'}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentDots[step.accent]} text-white`}
                    >
                      <span className="text-sm font-bold">{step.number}</span>
                    </div>
                    <span className={`text-sm font-semibold ${accentColors[step.accent].split(' ')[0]}`}>
                      {step.title}
                    </span>
                  </div>

                  <h3 className="text-h3 text-slate-900 mb-4">{step.headline}</h3>

                  <p className="text-body text-slate-600 leading-relaxed mb-6">
                    {step.description}
                  </p>

                  <ul className="space-y-3">
                    {step.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-body-sm text-slate-700">
                        <ArrowRight
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${accentColors[step.accent].split(' ')[0]}`}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mockup side */}
                <div className={isReversed ? 'lg:order-1' : 'lg:order-2'}>
                  <Mockup />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
