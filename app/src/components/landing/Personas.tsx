import { Users, BarChart3, Zap, Shield, TrendingUp, Clock, DollarSign, FileText, Search } from "lucide-react";

const personas = [
  {
    name: "Claire Martin",
    role: "Founder & Ops Lead",
    company: "22-person startup",
    avatarColor: "bg-blue-500",
    quote: "I need to see where every dollar goes without chasing receipts across a dozen channels.",
    features: [
      { icon: BarChart3, label: "Real-time budget dashboards" },
      { icon: TrendingUp, label: "Overspend alerts by project" },
      { icon: FileText, label: "Full compliance audit trail" },
    ],
  },
  {
    name: "Marc Chen",
    role: "Senior Developer",
    company: "Team of 18",
    avatarColor: "bg-purple-500",
    quote: "I just want to buy what my team needs without a 3-page form and a two-week wait.",
    features: [
      { icon: Zap, label: "2-minute smart request form" },
      { icon: Clock, label: "Live approval status tracking" },
      { icon: Search, label: "Slack & Teams notifications" },
    ],
  },
  {
    name: "Sophie Reyes",
    role: "Ops Manager",
    company: "30-person company",
    avatarColor: "bg-green-500",
    quote: "I need guardrails that enforce themselves, not ones I have to babysit.",
    features: [
      { icon: Shield, label: "Configurable approval workflows" },
      { icon: DollarSign, label: "Policy engine with auto-enforcement" },
      { icon: Users, label: "Vendor performance scoring" },
    ],
  },
];

export function Personas() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Badge + Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 mb-5">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-caption font-semibold text-blue-600 uppercase tracking-wider">Personas</span>
          </div>
          <h2 className="text-h2 text-slate-900 mb-4">
            One tool for everyone<br />wearing multiple hats.
          </h2>
          <p className="text-body-lg text-slate-600 max-w-2xl">
            Whether you handle finances, ship code, or keep operations running  - 
            Reqflow gives you a view shaped around your decisions.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((persona, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col">
              {/* Avatar + Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full ${persona.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                  {persona.name.charAt(0)}
                </div>
                <div>
                  <div className="text-body font-semibold text-slate-900">{persona.name}</div>
                  <div className="text-caption text-slate-500">
                    {persona.role} · {persona.company}
                  </div>
                </div>
              </div>

              {/* Quote */}
              <p className="text-body text-slate-600 italic leading-relaxed mb-8 flex-1">
                &ldquo;{persona.quote}&rdquo;
              </p>

              {/* Features */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                {persona.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2.5">
                    <feature.icon className="w-4 h-4 text-blue-600 flex-shrink-0" strokeWidth={2} />
                    <span className="text-body-sm text-slate-700">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
