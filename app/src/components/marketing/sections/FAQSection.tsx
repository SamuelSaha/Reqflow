'use client';

/**
 * FAQ Section — Accordion with expand/collapse
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const faqs = [
  {
    question: 'How fast can we get Reqflow running?',
    answer:
      'Most businesses go live in under 10 minutes. Connect Slack, set your first approval rule, and start receiving purchase requests. No onboarding call required.',
  },
  {
    question: 'Is Reqflow actually free right now?',
    answer:
      "Yes. During early access, everything is free with no limits. No credit card, no trial countdown. We want you to use it, stress-test it, and tell us what to build next.",
  },
  {
    question: 'What tools does Reqflow integrate with?',
    answer:
      'Slack, Microsoft Teams, QuickBooks, Xero, Google Workspace, and Pennylane. We add new integrations based on what early users ask for.',
  },
  {
    question: 'Is our data secure and GDPR compliant?',
    answer:
      'Yes. All data is encrypted at rest and in transit, hosted in EU data centers, and fully GDPR compliant. We never share your data with third parties.',
  },
  {
    question: "We're only 15 people. Is this overkill for us?",
    answer:
      "Not at all. Reqflow was built specifically for businesses of 5 to 50 people. The smaller you are, the less you can afford to waste time on manual procurement. Most of our early users are under 30 people.",
  },
  {
    question: 'Do we need to switch from QuickBooks/Xero to use Reqflow?',
    answer:
      'No. Reqflow integrates with QuickBooks and Xero \u2014 we sync invoices and vendors automatically. Keep your existing accounting software and add Reqflow for procurement workflows on top.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20 px-6 md:px-12 lg:px-20 flex flex-col items-center gap-12">
      {/* Header */}
      <div className="max-w-[700px] text-center flex flex-col items-center gap-4">
        <h2 className="text-h3 text-slate-900">Common questions</h2>
        <p className="text-body-lg text-slate-600">
          What small businesses ask before signing up.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="w-full max-w-[800px] rounded-2xl border border-slate-200 overflow-hidden bg-white">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          const isLast = i === faqs.length - 1;
          return (
            <div key={i} className={!isLast ? 'border-b border-slate-200' : ''}>
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-body font-semibold text-slate-900 pr-4">{faq.question}</span>
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-6 pb-5">
                  <p className="text-body text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
