import {
  Scale,
  Sparkles,
  FileDown,
  Check,
  ArrowRight,
  BadgeCheck,
  TrendingUp,
  Star,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Case Builder Showcase (Features Page — full breakdown)             */
/* ------------------------------------------------------------------ */

const alternatives = [
  {
    vendor: "Notion",
    cost: "€8/user/mo",
    annual: "€4,800/yr",
    score: 87,
    recommended: false,
    pros: ["Flexible workspace", "Strong API", "Good docs support"],
  },
  {
    vendor: "Confluence",
    cost: "€5.75/user/mo",
    annual: "€3,450/yr",
    score: 92,
    recommended: true,
    pros: ["Jira integration", "Best price/seat", "SSO included"],
  },
  {
    vendor: "Slite",
    cost: "€10/user/mo",
    annual: "€6,000/yr",
    score: 74,
    recommended: false,
    pros: ["Clean UX", "AI search built-in", "Fast onboarding"],
  },
];

export function CaseBuilderShowcase() {
  return (
    <section className="bg-gradient-to-b from-blue-50 via-white to-slate-50 py-20 px-20 flex flex-col items-center gap-16">
      {/* Header */}
      <div className="max-w-[700px] text-center flex flex-col items-center gap-4">
        <div className="bg-violet-50 rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-violet-600" />
          <span className="text-[13px] font-semibold text-violet-600">
            AI-Powered Case Builder
          </span>
        </div>
        <h2 className="text-[44px] font-bold leading-[1.15] tracking-tight text-slate-900">
          Every purchase over €500 gets
          <br />a business case. Automatically.
        </h2>
        <p className="text-[18px] leading-relaxed text-slate-600 max-w-[620px]">
          No more guessing which vendor is best. Reqflow's AI researches
          alternatives, compares pricing, and builds a structured case — so
          approvers get context, not just a number.
        </p>
      </div>

      {/* Content: Bullets + Mockup */}
      <div className="max-w-[1200px] flex gap-12 items-center">
        <div className="flex-1 flex flex-col gap-5">
          <span className="bg-violet-50 rounded-md px-3 py-1 text-[11px] font-bold text-violet-600 tracking-wide w-fit">
            BUILT INTO THE REQUEST FLOW
          </span>
          <h3 className="text-[28px] font-bold tracking-tight text-slate-900">
            Compare Alternatives Before You Even Submit
          </h3>
          <p className="text-[16px] leading-relaxed text-slate-600">
            When a request crosses the €500 threshold, Case Builder activates
            automatically. AI pre-fills vendor data from public sources — pricing,
            reviews, contract terms — and presents 2-3 structured alternatives
            side-by-side.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              "AI researches vendors and fills pricing automatically",
              "Side-by-side comparison with pros, cons, and terms",
              "Budget impact shown before you submit",
              "Becomes part of the approval — approvers see your work",
              "Export to PDF for audit trail and compliance",
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

        {/* Mockup UI */}
        <div className="w-[560px] bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
          {/* Header bar */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-violet-600" />
              <span className="text-[14px] font-bold text-slate-900">
                Case Builder
              </span>
              <span className="bg-violet-50 text-violet-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                AI-Assisted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-[11px] font-medium text-slate-500 border border-slate-200 rounded-md px-2 py-1">
                <FileDown className="w-3 h-3" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Request context */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <span className="text-[11px] text-slate-500">
              Request:{" "}
              <span className="font-semibold text-slate-700">
                Knowledge base tool for 50-person team
              </span>
              {" · "}
              <span className="font-semibold text-amber-600">
                Triggered at €4,800+/yr
              </span>
            </span>
          </div>

          {/* Alternatives grid */}
          <div className="px-4 py-4 flex gap-3">
            {alternatives.map((alt) => (
              <div
                key={alt.vendor}
                className={`flex-1 rounded-lg border p-3 flex flex-col gap-2.5 ${
                  alt.recommended
                    ? "border-green-300 bg-green-50/50 shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-slate-900">
                    {alt.vendor}
                  </span>
                  {alt.recommended && (
                    <BadgeCheck className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[17px] font-bold text-slate-900">
                    {alt.annual}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {alt.cost}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-2.5 h-2.5 ${
                          s <= Math.round(alt.score / 20)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      alt.score >= 90
                        ? "bg-green-100 text-green-700"
                        : alt.score >= 80
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {alt.score}/100
                  </span>
                </div>
                {alt.recommended && (
                  <span className="text-[9px] font-bold text-green-600 bg-green-100 rounded px-1.5 py-0.5 w-fit">
                    AI RECOMMENDED
                  </span>
                )}
                <div className="flex flex-col gap-1.5 mt-1">
                  {alt.pros.map((pro) => (
                    <div key={pro} className="flex items-start gap-1">
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-slate-600 leading-tight">
                        {pro}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Budget impact footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-medium text-slate-600">
                Budget impact:{" "}
                <span className="font-bold text-slate-900">
                  12% of Q1 remaining
                </span>
              </span>
            </div>
            <div className="w-[120px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: "12%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Case Builder Spotlight (Homepage — compact callout)                */
/* ------------------------------------------------------------------ */
export function CaseBuilderSpotlight() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-blue-50/50 py-16 px-20 flex flex-col items-center gap-10">
      <div className="max-w-[1000px] w-full bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="flex items-stretch">
          {/* Left: Copy */}
          <div className="flex-1 p-10 flex flex-col justify-center gap-4">
            <div className="bg-violet-50 rounded-full px-3 py-1 flex items-center gap-1.5 w-fit">
              <Scale className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-[12px] font-semibold text-violet-600">
                Case Builder
              </span>
            </div>
            <h2 className="text-[32px] font-bold leading-[1.2] tracking-tight text-slate-900">
              Built-in business cases
              <br />
              for every big purchase.
            </h2>
            <p className="text-[16px] leading-relaxed text-slate-600 max-w-[400px]">
              Purchases over €500 automatically trigger an AI-powered comparison
              of 2-3 vendor alternatives — pricing, reviews, and budget impact —
              so approvers never fly blind.
            </p>
            <a
              href="/features"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-blue-600 hover:text-blue-700 transition-colors w-fit"
            >
              See how it works
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right: Mini mockup */}
          <div className="w-[380px] bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-[11px] font-semibold text-slate-500">
                3 alternatives found
              </span>
            </div>
            {[
              { name: "Notion", cost: "€4,800/yr", rec: false, score: 87 },
              { name: "Confluence", cost: "€3,450/yr", rec: true, score: 92 },
              { name: "Slite", cost: "€6,000/yr", rec: false, score: 74 },
            ].map((v) => (
              <div
                key={v.name}
                className={`rounded-lg border p-3 flex items-center justify-between ${
                  v.rec
                    ? "border-green-300 bg-green-50/60"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-900">
                    {v.name}
                  </span>
                  {v.rec && (
                    <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      v.score >= 90
                        ? "bg-green-100 text-green-700"
                        : v.score >= 80
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {v.score}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-700">
                    {v.cost}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-[10px] text-slate-400">
                Budget impact: 12% of Q1
              </span>
              <span className="text-[10px] font-semibold text-green-600">
                €1,350 saved vs. most expensive
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
