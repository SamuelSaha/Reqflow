import { PageShell } from "@/components/layout";
import { Heart, MapPin, Users, Code, Lightbulb, Target, Sparkles } from "lucide-react";

export default function CareersPage() {
  const values = [
    {
      icon: Target,
      title: "Start with the problem",
      desc: "We don't build features because they sound cool. We solve actual procurement pain points that small teams face every day.",
    },
    {
      icon: Lightbulb,
      title: "Ship fast, learn faster",
      desc: "Beta customers see new features within days of asking. We iterate based on real usage, not 6-month roadmaps.",
    },
    {
      icon: Heart,
      title: "Honest about limitations",
      desc: "We'd rather lose a sale than promise something we can't deliver. Transparency builds trust, always.",
    },
    {
      icon: Users,
      title: "No procurement jargon",
      desc: "Our customers don't have procurement teams. We write and build for real people doing real work.",
    },
  ];

  const perks = [
    "Competitive salary + meaningful equity (early stage)",
    "Work from Paris office or remote (EU timezone)",
    "€1,500/year learning budget (books, courses, conferences)",
    "Latest MacBook Pro M-series + desk setup of choice",
    "5 weeks vacation (French standard) + 10 public holidays",
    "Health insurance (Mutuelle) fully covered",
    "Lunch stipend (Swile card with €10/day)",
    "Co-working space membership if remote",
  ];

  return (
    <PageShell>
      <section className="pt-20 pb-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white via-[var(--warm-50)] to-white">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-200 bg-violet-50 mb-6">
              <Heart className="w-4 h-4 text-violet-600" />
              <span className="text-caption font-semibold text-violet-900">
                Careers
              </span>
            </div>
            <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">
              Help us build procurement software that doesn't suck.
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed max-w-[700px] mx-auto">
              We're a small team in Paris building Reqflow - procurement for teams moving too fast for spreadsheets. No open roles right now, but we're growing fast.
            </p>
          </div>

          {/* Current team status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-10 mb-16">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-h4 font-bold text-slate-900 mb-3">
                  We're 3 people right now
                </h2>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Two founders (product + engineering) and one contract designer. We're bootstrapped, profitable from month one (beta revenue), and growing steadily.
                </p>
                <p className="text-body text-slate-600 leading-relaxed">
                  We'll hire when we have clear, urgent needs - not because we raised a round. Expect roles in engineering (full-stack), product design, and customer success over the next 6-12 months.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <MapPin className="w-6 h-6 text-blue-600 mb-3" />
                <h3 className="text-body font-bold text-slate-900 mb-2">Location</h3>
                <p className="text-body-sm text-slate-600">
                  Paris office (11th arrondissement) or remote within EU timezone (CET ±2 hours).
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <Code className="w-6 h-6 text-green-600 mb-3" />
                <h3 className="text-body font-bold text-slate-900 mb-2">Tech Stack</h3>
                <p className="text-body-sm text-slate-600">
                  Next.js 16, React 19, TypeScript, Tailwind v4, Drizzle ORM, PostgreSQL, tRPC, BullMQ.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <Sparkles className="w-6 h-6 text-violet-600 mb-3" />
                <h3 className="text-body font-bold text-slate-900 mb-2">Stage</h3>
                <p className="text-body-sm text-slate-600">
                  Early beta with 7 paying customers. Product-market fit search, shipping daily, direct customer contact.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-h3 font-bold text-slate-900 mb-8 text-center">
              How we work
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-h5 font-bold text-slate-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-body text-slate-600 leading-relaxed">
                      {value.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What we offer */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-10 mb-16 text-white">
            <h2 className="text-h4 font-bold mb-6">What we offer</h2>
            <p className="text-body text-slate-300 mb-8 leading-relaxed">
              We're early stage, so you won't get Google-level compensation. But you'll get meaningful equity, direct impact on product direction, and the chance to build something from scratch.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {perks.map((perk) => (
                <div key={perk} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-caption">✓</span>
                  </div>
                  <span className="text-body text-slate-200">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What we're looking for (future roles) */}
          <div className="mb-16">
            <h2 className="text-h3 font-bold text-slate-900 mb-8 text-center">
              Roles we'll hire soon
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-h5 font-bold text-slate-900">
                    Full-Stack Engineer
                  </h3>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-caption font-semibold rounded-full">
                    Q2 2026
                  </span>
                </div>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  We need someone who can ship features end-to-end: design implementation, tRPC endpoints, database schema, job queues, and deployment. TypeScript fluency required.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Next.js", "React", "TypeScript", "PostgreSQL", "tRPC"].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 text-caption font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-h5 font-bold text-slate-900">
                    Product Designer
                  </h3>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-caption font-semibold rounded-full">
                    Q3 2026
                  </span>
                </div>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Design the full procurement experience: request forms, approval flows, budget dashboards, and mobile app. Strong interaction design and prototyping skills.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Figma", "Prototyping", "User Research", "Design Systems", "Mobile"].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-violet-50 text-violet-700 text-caption font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-h5 font-bold text-slate-900">
                    Customer Success Lead
                  </h3>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-caption font-semibold rounded-full">
                    Q3 2026
                  </span>
                </div>
                <p className="text-body text-slate-600 leading-relaxed mb-4">
                  Own onboarding, support, and customer relationships. Help beta customers succeed, collect feedback, and feed insights back to product. Procurement or fintech ops experience a plus.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Customer Onboarding", "Support", "Operations", "Procurement"].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 text-caption font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Get in touch */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-10 text-center">
            <h2 className="text-h4 font-bold text-slate-900 mb-4">
              Interested in joining?
            </h2>
            <p className="text-body text-slate-700 leading-relaxed mb-8 max-w-[600px] mx-auto">
              No open roles right now, but we're growing. If you're excited about building procurement software that doesn't suck, send us an email. Tell us what you'd bring and why Reqflow.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="mailto:careers@reqflow.co"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-body font-semibold hover:bg-blue-700 transition-colors no-underline"
              >
                careers@reqflow.co
              </a>
            </div>
            <p className="text-body-sm text-slate-600 mt-6">
              We respond to every email. Might take a few days, but we will respond.
            </p>
          </div>

          {/* Team photo placeholder */}
          <div className="mt-12 bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-body text-slate-600 mb-4">
              📸 Team photo coming soon
            </p>
            <p className="text-body-sm text-slate-500">
              We're too busy shipping right now. Will add this when we hit 10 customers.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
