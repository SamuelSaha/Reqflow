import { FileText, Receipt, Building2, Shield, ScrollText, Sparkles, Layers } from "lucide-react";

const features = [
  {
    icon: FileText,
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    title: "Purchase Orders",
    description: "Turn approved requests into POs automatically. Track what you ordered, match it to invoices, and keep a clean paper trail.",
  },
  {
    icon: Receipt,
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    title: "Invoice Processing",
    description: "Forward invoices or snap a photo. AI reads the details, matches them to POs, and flags anything that looks off.",
  },
  {
    icon: Building2,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    title: "Vendor Management",
    description: "Keep all your vendor info in one place. See who you work with, what you spend, and whether contracts are up to date.",
  },
  {
    icon: Shield,
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
    title: "Compliance & Audit",
    description: "Every purchase is logged automatically. Set simple spend rules so nothing slips through without the right sign-off.",
  },
  {
    icon: ScrollText,
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    title: "Contract Management",
    description: "Upload contracts and let AI pull out the key dates and terms. Get reminded before renewals sneak up on you.",
  },
  {
    icon: Sparkles,
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    title: "AI Copilot",
    description: "Ask questions about your spending in plain English. Get smart suggestions on where to save and what needs attention.",
  },
];

export function Features() {
  return (
    <section className="bg-slate-900 py-20 md:py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Badge + Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 mb-5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-caption font-semibold text-blue-400 uppercase tracking-wider">Features</span>
          </div>
          <h2 className="text-h2 text-white mb-4">
            Stop chasing approvals.<br />Start buying smarter.
          </h2>
          <p className="text-body-lg text-slate-400 max-w-2xl">
            Requests, approvals, purchase orders, and spend tracking in one place.
            Built for teams that move fast and hate busywork.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-800/50 p-8 hover:bg-slate-800 transition-colors duration-200">
              <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} strokeWidth={1.5} />
              </div>
              <h3 className="text-body font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-body-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
