import { PageShell } from "@/components/layout";

export default function AboutPage() {
  return (
    <PageShell>
      <section className="pt-20 pb-20 px-20">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-6">
            Why We're Building Reqflow
          </h1>

          <div className="text-body-lg text-slate-600 leading-[1.8] mb-12 space-y-6">
            <p>Every company with 50-250 employees hits the same wall: procurement becomes a bottleneck, but hiring a dedicated procurement team doesn't make sense yet.</p>
            <p>The finance team ends up spending 8+ hours per week chasing approvals, reconciling purchases, and wondering what subscriptions they're actually paying for.</p>
            <p>We're building Reqflow to be the procurement "front door" for companies in this stage - structured enough to create visibility and control, simple enough that everyone actually uses it.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Where We Are Today</h2>
            <div className="space-y-4 text-body text-slate-600 leading-[1.7]">
              <p><strong className="text-slate-900">Early beta.</strong> We have a working Slack-based intake form, basic approval routing, and manual QuickBooks/Xero sync. It's not polished, but it works.</p>
              <p><strong className="text-slate-900">Seeking 10 beta customers.</strong> We're looking for companies willing to tolerate rough edges in exchange for €99/mo pricing (locked forever) and direct input on the roadmap.</p>
              <p><strong className="text-slate-900">Built for feedback.</strong> This isn't a "take it or leave it" product. We're actively shaping it based on what our first customers need.</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-6">Our Principles</h2>
            <div className="grid gap-5">
              {[
                { title: "€0 infrastructure obsession", desc: "We run on Oracle Always Free, Neon/Upstash free tiers, and open-source tools. This forces us to stay lean and pass savings to customers." },
                { title: "Slack-native, not Slack-integrated", desc: "If it's not in Slack, people won't use it. We're building for where work actually happens, not where we think it should happen." },
                { title: "No procurement jargon", desc: "You don't have a procurement team. We're not going to pretend you need one or use language designed for enterprise buyers." },
                { title: "Honest about limitations", desc: "We'd rather lose a sale than promise something we can't deliver. If it's not ready, we'll tell you." },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <h3 className="text-body-lg font-bold text-blue-600 mb-2">{item.title}</h3>
                  <p className="text-body text-slate-600 leading-[1.7]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 mb-12">
            <h2 className="text-h4 font-bold text-slate-900 mb-5">Who's Building This</h2>
            <div className="space-y-4 text-body text-slate-600 leading-[1.7]">
              <p>Reqflow is built by a small team who've experienced this problem firsthand - as the finance person drowning in Slack procurement requests, and as the eng manager waiting 11 days for a $500/mo SaaS approval.</p>
              <p>We're based in Paris, hosting on EU infrastructure, and building for the European market first (though we welcome companies elsewhere).</p>
            </div>
          </div>

          <div className="text-center py-12">
            <p className="text-body text-slate-600 mb-6">Interested in shaping this with us?</p>
            <a href="/beta" className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-lg text-body font-bold no-underline hover:bg-blue-700 transition-colors">
              Apply for beta access
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
