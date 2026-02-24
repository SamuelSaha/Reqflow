import {
  CreditCard,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Pricing Section                                                    */
/* ------------------------------------------------------------------ */
export function Pricing() {
  return (
    <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 px-20 flex flex-col items-center gap-16">
      <div className="max-w-[700px] text-center flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 rounded-full px-3.5 py-1.5">
          <CreditCard className="text-blue-600" size={14} />
          <span className="text-[13px] font-semibold text-blue-600">
            Early Access
          </span>
        </span>

        <h2 className="text-[44px] font-bold leading-[1.15] tracking-[-1px] text-slate-900">
          Free while we build this together.
        </h2>

        <p className="text-[18px] leading-[1.6] text-slate-600 max-w-[620px]">
          Reqflow is in early access. Everything is free for now. No credit
          card, no trial countdown, no limits. Use it, break it, tell us
          what&apos;s missing.
        </p>
      </div>

      <div className="w-[800px]">
        <div className="bg-white rounded-2xl border-2 border-blue-600 p-10 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[56px] font-bold tracking-[-2px] text-slate-900">
              $0
            </span>
            <span className="text-[18px] font-medium text-slate-600">
              Free during early access
            </span>
          </div>

          <div className="w-full h-px bg-slate-200" />

          <div className="w-full flex flex-col gap-3">
            {[
              "Unlimited users and requests",
              "Full approval workflows",
              "Budget tracking and purchase orders",
              "Slack, QuickBooks, Xero integrations",
              "AI copilot for spend analysis",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-[15px] font-medium text-slate-600">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full h-px bg-slate-200" />

          <button className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-12 py-3.5 rounded-[10px] text-[16px] font-semibold hover:bg-blue-700 transition-colors">
            Get Started Free
            <ArrowRight className="w-[18px] h-[18px]" />
          </button>

          <p className="text-[14px] font-medium text-slate-400 text-center">
            Paid plans will come later. Early users get locked-in pricing.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Section                                                        */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    question: "How fast can we get Reqflow running?",
    answer:
      "Most teams go live in under 10 minutes. Connect Slack, set your first approval rule, and start receiving purchase requests. No onboarding call required.",
  },
  {
    question: "Is Reqflow actually free right now?",
    answer:
      "Yes. During early access, everything is free with no limits. No credit card, no trial countdown. We want you to use it, stress-test it, and tell us what to build next.",
  },
  {
    question: "What tools does Reqflow integrate with?",
    answer:
      "Slack, Microsoft Teams, QuickBooks, Xero, Google Workspace, and Pennylane. We add new integrations based on what early users ask for.",
  },
  {
    question: "Is our data secure and GDPR compliant?",
    answer:
      "Yes. All data is encrypted at rest and in transit, hosted in EU data centers, and fully GDPR compliant. We never share your data with third parties.",
  },
  {
    question: "We're only 15 people. Is this overkill for us?",
    answer:
      "Not at all. Reqflow was built specifically for teams of 5 to 50. The smaller you are, the less you can afford to waste time on manual procurement. Most of our early users are under 30 people.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20 px-20 flex flex-col items-center gap-12">
      <div className="max-w-[700px] text-center flex flex-col items-center gap-4">
        <h2 className="text-[36px] font-bold tracking-[-0.5px] text-slate-900">
          Common questions
        </h2>
        <p className="text-[18px] text-slate-600">
          What small teams ask before signing up.
        </p>
      </div>

      <div className="w-[800px] rounded-2xl border border-slate-200 overflow-hidden">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          const isLast = i === faqs.length - 1;
          return (
            <div
              key={i}
              className={!isLast ? "border-b border-slate-200" : ""}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-[16px] font-semibold text-slate-900">
                  {faq.question}
                </span>
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-6 pb-5">
                  <p className="text-[15px] leading-[1.6] text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA Section                                                  */
/* ------------------------------------------------------------------ */
export function FinalCTA() {
  return (
    <section className="bg-blue-600 py-20 px-20 flex flex-col items-center gap-8">
      <h2 className="text-[44px] font-bold leading-[1.15] tracking-[-1px] text-white text-center max-w-[700px] whitespace-pre-line">
        {"Stop buying things\nover Slack."}
      </h2>

      <p className="text-[18px] leading-[1.6] text-white/80 text-center max-w-[600px]">
        Reqflow gives your small team a real procurement workflow. Free during
        early access. No credit card, no limits.
      </p>

      <div className="flex items-center gap-4">
        <button className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-[10px] text-[16px] font-semibold hover:bg-blue-50 transition-colors">
          Get Started Free
          <ArrowRight className="w-[18px] h-[18px]" />
        </button>
        <button className="inline-flex items-center gap-2 border-[1.5px] border-white/25 text-white px-8 py-3.5 rounded-[10px] text-[16px] font-semibold hover:bg-white/10 transition-colors">
          See How It Works
        </button>
      </div>

      <p className="text-[14px] font-medium text-white/60">
        100% free &nbsp;&middot;&nbsp; No card required &nbsp;&middot;&nbsp;
        Live in under 10 minutes
      </p>
    </section>
  );
}

