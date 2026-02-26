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
          <span className="text-caption font-semibold text-blue-500">
            Built for Small Teams
          </span>
        </span>

        <h2 className="text-h2 text-white whitespace-pre-line">
          {"The full procurement lifecycle.\nNot just another form."}
        </h2>

        <p className="text-body-lg text-slate-400 max-w-[620px]">
          From intake to renewal, every tool purchase is tracked, connected, and
          auditable. The story of why you bought it, who owns it, and when you
          can leave — captured automatically.
        </p>
      </div>

      <div className="relative z-10 max-w-[1200px] w-full grid grid-cols-2 gap-6">
        {largeCards.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group h-[260px] p-8 rounded-2xl bg-gradient-to-b from-[#1A2744] to-[#0F172A] border border-blue-600/20 flex flex-col gap-4 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(59,_130,_246,_0.2)] hover:border-blue-500/40 will-change-transform"
          >
            <div className="w-[52px] h-[52px] bg-[#1E3A5F] rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#2563EB] transition-all duration-200">
              <Icon className="text-blue-500 group-hover:text-blue-300 transition-colors duration-200" size={26} />
            </div>
            <h3 className="text-h4 text-white group-hover:text-blue-300 transition-colors duration-200">{title}</h3>
            <p className="text-body-sm text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-[1200px] w-full grid grid-cols-3 gap-6">
        {smallCards.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group p-7 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col gap-4 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(59,_130,_246,_0.15)] hover:border-slate-600 will-change-transform"
          >
            <div className="w-[44px] h-[44px] bg-[#1E3A5F] rounded-[10px] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-200">
              <Icon className="text-blue-500 group-hover:text-blue-300 transition-colors duration-200" size={22} />
            </div>
            <h3 className="text-h5 text-white group-hover:text-blue-300 transition-colors duration-200">{title}</h3>
            <p className="text-body-sm text-slate-400">{desc}</p>
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
    <section className="bg-[var(--warm-50)] py-16 md:py-20 lg:py-24 px-6 md:px-12 lg:px-20 flex flex-col items-center gap-16">
      <div className="max-w-[700px] text-center flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-1.5 bg-green-50 rounded-full px-3.5 py-1.5">
          <TrendingUp className="text-green-600" size={14} />
          <span className="text-caption font-semibold text-green-600">
            Measured Outcomes
          </span>
        </span>

        <h2 className="text-h2 text-slate-900 whitespace-pre-line">
          {"What happens when buying\nstops being a mess."}
        </h2>
      </div>

      <div className="max-w-[1200px] w-full grid grid-cols-4 gap-6">
        {outcomes.map(({ value, label, sub }) => (
          <div
            key={value}
            className="group bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col items-center gap-3 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 hover:bg-white will-change-transform"
          >
            <span className="text-h2 font-bold text-blue-600 tracking-tight group-hover:scale-110 transition-transform duration-200">
              {value}
            </span>
            <span className="text-body-sm font-medium text-slate-600 text-center">
              {label}
            </span>
            <span className="text-caption font-medium text-slate-400 normal-case tracking-normal">
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
          <span className="text-caption font-semibold text-blue-600">
            Integrations
          </span>
        </span>

        <h2 className="text-h2 text-slate-900 whitespace-pre-line">
          {"Plugs into the tools\nyour team already uses."}
        </h2>

        <p className="text-body-lg text-slate-600 max-w-[620px]">
          One-click integrations with your accounting, chat, and identity tools.
          Data flows both ways, so nothing needs manual entry.
        </p>
      </div>

      <div className="max-w-[1000px] w-full flex justify-center gap-6 flex-wrap">
        {integrations.map(({ letter, bg, name }) => (
          <div
            key={name}
            className="group w-[148px] h-[120px] bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 will-change-transform"
          >
            <div
              className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
              style={{ backgroundColor: bg }}
            >
              <span className="text-white font-bold text-body-lg">
                {letter}
              </span>
            </div>
            <span className="text-body-sm font-semibold text-slate-900">
              {name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
