import {
  Layers,
  FileText,
  ScanLine,
  Building2,
  ShieldCheck,
  FileSearch,
  Sparkles,
  TrendingUp,
  Plug,
  CalendarClock,
  FlaskConical,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Features Grid (Dark Section)                                       */
/* ------------------------------------------------------------------ */
export function FeaturesGrid() {
  const largeCards = [
    {
      icon: FileText,
      title: "Purchase Orders",
      desc: "Turn approved requests into POs automatically. Track what you ordered, match it to invoices, and keep a clean paper trail.",
    },
    {
      icon: ScanLine,
      title: "Invoice Processing",
      desc: "Forward invoices or snap a photo. AI reads the details, matches them to POs, and flags anything that looks off.",
    },
  ];

  const smallCards = [
    {
      icon: Building2,
      title: "Vendor Management",
      desc: "Keep all your vendor info in one place. See who you work with, what you spend, and whether contracts are up to date.",
    },
    {
      icon: ShieldCheck,
      title: "Compliance & Audit",
      desc: "Every purchase is logged automatically. Set simple spend rules so nothing slips through without the right sign-off.",
    },
    {
      icon: FileSearch,
      title: "Contract Management",
      desc: "Upload contracts and let AI pull out the key dates and terms. Get reminded before renewals sneak up on you.",
    },
    {
      icon: Sparkles,
      title: "AI Copilot",
      desc: "Ask questions about your spending in plain English. Get smart suggestions on where to save and what needs attention.",
    },
    {
      icon: CalendarClock,
      title: "Renewal Tracking",
      desc: "Track notice deadlines, not just renewal dates. Know when you must decide — before auto-renew locks you in for another year.",
    },
    {
      icon: FlaskConical,
      title: "Trial Management",
      desc: "Track every trial with success criteria and auto-reminders. No more silent conversions — trials either become purchases or end cleanly.",
    },
  ];

  return (
    <section className="relative bg-[#0F172A] p-20 flex flex-col items-center gap-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0C1425] via-[#0F172A] to-[#0C1425]" />

      <div className="relative z-10 max-w-[700px] text-center flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-1.5 border border-slate-700 rounded-full px-3.5 py-1.5">
          <Layers className="text-blue-500" size={14} />
          <span className="text-[13px] font-semibold text-blue-500">
            Built for Small Teams
          </span>
        </span>

        <h2 className="text-[44px] font-bold leading-[1.15] tracking-tight text-white whitespace-pre-line">
          {"The full procurement lifecycle.\nNot just another form."}
        </h2>

        <p className="text-[18px] leading-relaxed text-slate-400 max-w-[620px]">
          From intake to renewal, every tool purchase is tracked, connected, and
          auditable. The story of why you bought it, who owns it, and when you
          can leave — captured automatically.
        </p>
      </div>

      <div className="relative z-10 max-w-[1200px] w-full grid grid-cols-2 gap-6">
        {largeCards.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="h-[260px] p-8 rounded-2xl bg-gradient-to-b from-[#1A2744] to-[#0F172A] border border-blue-600/20 flex flex-col gap-4"
          >
            <div className="w-[52px] h-[52px] bg-[#1E3A5F] rounded-xl flex items-center justify-center">
              <Icon className="text-blue-500" size={26} />
            </div>
            <h3 className="text-[22px] font-bold text-white">{title}</h3>
            <p className="text-[15px] text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-[1200px] w-full grid grid-cols-3 gap-6">
        {smallCards.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="p-7 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col gap-4"
          >
            <div className="w-[44px] h-[44px] bg-[#1E3A5F] rounded-[10px] flex items-center justify-center">
              <Icon className="text-blue-500" size={22} />
            </div>
            <h3 className="text-[18px] font-bold text-white">{title}</h3>
            <p className="text-[14px] text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Social Proof Section                                               */
/* ------------------------------------------------------------------ */
export function SocialProof() {
  const outcomes = [
    {
      value: "<30min",
      label: "Average time to get approval",
      sub: "No more Slack threads and lost emails",
    },
    {
      value: "100%",
      label: "Tools with an owner and renewal date",
      sub: "No more orphaned subscriptions",
    },
    {
      value: "Zero",
      label: "Missed cancellation windows",
      sub: "Notice deadlines tracked, not just renewal dates",
    },
    {
      value: "5x",
      label: "Faster audit prep",
      sub: "Every purchase linked to why, who, and what it costs",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 p-20 flex flex-col items-center gap-16">
      <div className="max-w-[700px] text-center flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-1.5 bg-green-50 rounded-full px-3.5 py-1.5">
          <TrendingUp className="text-green-600" size={14} />
          <span className="text-[13px] font-semibold text-green-600">
            Measured Outcomes
          </span>
        </span>

        <h2 className="text-[44px] font-bold leading-[1.15] tracking-tight text-slate-900 whitespace-pre-line">
          {"What happens when buying\nstops being a mess."}
        </h2>
      </div>

      <div className="max-w-[1200px] w-full grid grid-cols-4 gap-6">
        {outcomes.map(({ value, label, sub }) => (
          <div
            key={value}
            className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col items-center gap-3"
          >
            <span className="text-[40px] font-bold text-blue-600 tracking-tight">
              {value}
            </span>
            <span className="text-[15px] font-medium text-slate-600 text-center">
              {label}
            </span>
            <span className="text-[13px] font-medium text-slate-400">
              {sub}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Integrations Section                                               */
/* ------------------------------------------------------------------ */
export function Integrations() {
  const integrations = [
    { letter: "S", bg: "#4A154B", name: "Slack" },
    { letter: "T", bg: "#5059C9", name: "Teams" },
    { letter: "Q", bg: "#2CA01C", name: "QuickBooks" },
    { letter: "X", bg: "#13B5EA", name: "Xero" },
    { letter: "G", bg: "#4285F4", name: "Google" },
    { letter: "P", bg: "#FF5722", name: "Pennylane" },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 via-blue-50/50 to-slate-50 p-20 flex flex-col items-center gap-12">
      <div className="max-w-[700px] text-center flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 rounded-full px-3.5 py-1.5">
          <Plug className="text-blue-600" size={14} />
          <span className="text-[13px] font-semibold text-blue-600">
            Integrations
          </span>
        </span>

        <h2 className="text-[44px] font-bold leading-[1.15] tracking-tight text-slate-900 whitespace-pre-line">
          {"Plugs into the tools\nyour team already uses."}
        </h2>

        <p className="text-[18px] leading-relaxed text-slate-600 max-w-[620px]">
          One-click integrations with your accounting, chat, and identity tools.
          Data flows both ways, so nothing needs manual entry.
        </p>
      </div>

      <div className="max-w-[1000px] w-full flex justify-center gap-6 flex-wrap">
        {integrations.map(({ letter, bg, name }) => (
          <div
            key={name}
            className="w-[148px] h-[120px] bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center justify-center gap-3"
          >
            <div
              className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center"
              style={{ backgroundColor: bg }}
            >
              <span className="text-white font-bold text-[18px]">
                {letter}
              </span>
            </div>
            <span className="text-[14px] font-semibold text-slate-900">
              {name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
