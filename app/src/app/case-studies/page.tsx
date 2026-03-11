import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';
import { BookOpen, ArrowRight, Users, TrendingDown, Clock, Quote } from 'lucide-react';
import Link from 'next/link';

const caseStudies = [
  {
    slug: 'startup-22-people-saas-spend',
    company: 'TechFlow',
    size: '22-person startup',
    industry: 'B2B SaaS',
    logo: 'TF',
    logoColor: 'bg-blue-600',
    title: 'How TechFlow cut SaaS waste by 23% in 3 months',
    excerpt:
      'TechFlow was spending over $180K/year on SaaS tools with no centralized tracking. After implementing Reqflow, they identified $41K in duplicate subscriptions and unused licenses.',
    stats: [
      { value: '23%', label: 'SaaS spend reduced' },
      { value: '3 months', label: 'Time to full ROI' },
      { value: '< 2 hours', label: 'Avg. approval time' },
    ],
    quote:
      'We had no idea we were paying for three different project management tools until Reqflow flagged it.',
    author: 'Claire Martin, Ops Lead',
    featured: true,
  },
  {
    slug: 'agency-30-people-approval-workflows',
    company: 'BrightWave',
    size: '30-person agency',
    industry: 'Digital Agency',
    logo: 'BW',
    logoColor: 'bg-violet-600',
    title: 'BrightWave reduced approval time from 5 days to 2 hours',
    excerpt:
      'With team leads across 4 departments buying tools independently, BrightWave had no procurement process. Reqflow gave them automated routing without slowing anyone down.',
    stats: [
      { value: '5 days to 2h', label: 'Approval time' },
      { value: '100%', label: 'Purchases tracked' },
      { value: '0', label: 'Surprise renewals' },
    ],
    quote:
      'The approval chain is invisible to most people. They submit a request and it just gets handled.',
    author: 'Marc Dubois, CEO',
    featured: false,
  },
  {
    slug: 'fintech-15-people-compliance',
    company: 'PayGuard',
    size: '15-person fintech',
    industry: 'Financial Services',
    logo: 'PG',
    logoColor: 'bg-emerald-600',
    title: 'PayGuard achieved full procurement compliance for their SOC 2 audit',
    excerpt:
      'As a fintech, PayGuard needed a complete audit trail for every purchase decision. Reqflow provided the compliance layer without adding friction to their small team.',
    stats: [
      { value: 'Full', label: 'Audit compliance' },
      { value: '10 min', label: 'Setup time' },
      { value: '$0', label: 'Cost during early access' },
    ],
    quote:
      'Our auditors were impressed. Every purchase had a full paper trail from request to payment.',
    author: 'Sophie Reyes, Head of Ops',
    featured: false,
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <MarketingNav />
      <section className="pt-20 pb-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white via-[var(--warm-50)] to-white">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 mb-6">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-caption font-semibold text-blue-900">Case Studies</span>
            </div>
            <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">
              Real teams, real results
            </h1>
            <p className="text-body-lg text-slate-600 leading-relaxed max-w-[600px] mx-auto">
              See how small teams use Reqflow to take control of their procurement without adding
              overhead.
            </p>
          </div>

          {/* Case Studies */}
          <div className="space-y-8">
            {caseStudies.map((study, idx) => (
              <article
                key={study.slug}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className={idx === 0 ? 'md:flex' : ''}>
                  {idx === 0 && (
                    <div className="md:w-2/5 bg-gradient-to-br from-blue-50 to-violet-50 p-12 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className={`w-20 h-20 ${study.logoColor} rounded-2xl flex items-center justify-center mb-4 mx-auto`}
                        >
                          <span className="text-white text-h3 font-bold">{study.logo}</span>
                        </div>
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-caption font-bold rounded-full">
                          FEATURED
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={idx === 0 ? 'md:w-3/5 p-10' : 'p-8'}>
                    {/* Company info */}
                    <div className="flex items-center gap-3 mb-4">
                      {idx !== 0 && (
                        <div
                          className={`w-10 h-10 ${study.logoColor} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                        >
                          {study.logo}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-body-sm font-semibold text-slate-900">
                          {study.company}
                        </span>
                        <span className="text-caption text-slate-400">|</span>
                        <span className="text-caption text-slate-500">{study.size}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-caption font-medium rounded-full">
                          {study.industry}
                        </span>
                      </div>
                    </div>

                    {/* Title + excerpt */}
                    <h2 className="text-h4 font-bold text-slate-900 mb-3 leading-tight">
                      {study.title}
                    </h2>
                    <p className="text-body text-slate-600 leading-relaxed mb-6">{study.excerpt}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {study.stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                          <div className="text-h5 font-bold text-blue-600">{stat.value}</div>
                          <div className="text-caption text-slate-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Quote */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                      <div className="flex items-start gap-3">
                        <Quote className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-body-sm text-slate-700 italic leading-relaxed">
                            {study.quote}
                          </p>
                          <p className="text-caption text-slate-500 mt-2 font-medium">
                            {study.author}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/case-studies/${study.slug}`}
                      className="inline-flex items-center gap-2 text-body font-semibold text-blue-600 hover:text-blue-700 transition-colors no-underline"
                    >
                      Read full case study
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-slate-900 rounded-2xl border border-slate-700 p-10 text-center text-white">
            <h2 className="text-h4 font-bold mb-3">See Reqflow in action</h2>
            <p className="text-body text-slate-300 mb-6 max-w-[500px] mx-auto">
              Join the teams already using Reqflow to manage procurement. Free during early access,
              no credit card required.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl text-body font-semibold hover:bg-blue-700 transition-colors no-underline"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-slate-600 text-white px-8 py-3.5 rounded-xl text-body font-semibold hover:bg-slate-800 transition-colors no-underline"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </>
  );
}
