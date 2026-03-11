import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';
import { Mail, MessageCircle, BookOpen, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <>
      <MarketingNav />
      <section className="pt-20 pb-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white via-[var(--warm-50)] to-white">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">
              Support
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed max-w-[600px] mx-auto">
              We&apos;re a small team and we take support seriously. Here&apos;s how to get help.
            </p>
          </div>

          {/* Support channels */}
          <div className="space-y-6 mb-16">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-body-lg font-bold text-slate-900 mb-2">Email Support</h2>
                  <p className="text-body text-slate-600 leading-relaxed mb-3">
                    For bug reports, feature requests, or any questions about Reqflow.
                  </p>
                  <a
                    href="mailto:support@reqflow.co"
                    className="text-blue-600 font-semibold no-underline text-body"
                  >
                    support@reqflow.co
                  </a>
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-body-sm text-slate-500">
                      Response within 48 hours (business days, CET)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-body-lg font-bold text-slate-900 mb-2">
                    Shared Slack Channel
                  </h2>
                  <p className="text-body text-slate-600 leading-relaxed mb-3">
                    Beta customers get access to a shared Slack channel with the Reqflow team for
                    real-time support and feedback.
                  </p>
                  <p className="text-body-sm text-slate-500">
                    Available to active beta customers. We&apos;ll add you during onboarding.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-body-lg font-bold text-slate-900 mb-2">Documentation</h2>
                  <p className="text-body text-slate-600 leading-relaxed mb-3">
                    Guides, setup instructions, and FAQs. Most questions are answered here.
                  </p>
                  <Link
                    href="/documentation"
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold no-underline text-body"
                  >
                    Browse docs
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Beta note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-body-lg font-bold text-blue-900 mb-2">Beta Support</h3>
            <p className="text-body-sm text-blue-800 leading-relaxed max-w-[500px] mx-auto">
              During early access, support is best-effort with a 48-hour response time. We&apos;re
              hands-on and genuinely want to help you succeed with Reqflow.
            </p>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </>
  );
}
