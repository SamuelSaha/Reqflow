import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <>
      <MarketingNav />
      <section className="pt-20 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-body text-slate-500 mb-12">
            Last updated: February 2026 · Beta version
          </p>

          <p className="text-body text-slate-600 leading-[1.8] mb-8">
            This cookie policy explains how Reqflow (&quot;we&quot;, &quot;us&quot;) uses cookies and
            similar technologies. We keep things minimal and transparent.
          </p>

          <div className="space-y-12">
            {/* What are cookies */}
            <div>
              <h2 className="text-h4 font-bold text-slate-900 mb-5">What Are Cookies</h2>
              <p className="text-body text-slate-600 leading-[1.8]">
                Cookies are small text files stored on your device when you visit a website. They
                help the site remember your preferences and understand how you use it.
              </p>
            </div>

            {/* Cookies we use */}
            <div>
              <h2 className="text-h4 font-bold text-slate-900 mb-5">Cookies We Use</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 space-y-6">
                <div>
                  <h3 className="text-body-lg font-bold text-blue-600 mb-3">
                    Essential Cookies
                  </h3>
                  <p className="text-body text-slate-600 leading-[1.7]">
                    Required for authentication, security, and basic site functionality. These
                    cannot be disabled. Includes session tokens and CSRF protection.
                  </p>
                </div>
                <div>
                  <h3 className="text-body-lg font-bold text-blue-600 mb-3">
                    Analytics Cookies
                  </h3>
                  <p className="text-body text-slate-600 leading-[1.7]">
                    We use basic, privacy-respecting analytics to understand how people use
                    Reqflow. No third-party trackers during beta. Data is aggregated and
                    anonymized.
                  </p>
                </div>
                <div>
                  <h3 className="text-body-lg font-bold text-blue-600 mb-3">
                    Preference Cookies
                  </h3>
                  <p className="text-body text-slate-600 leading-[1.7]">
                    Remember your settings like theme preference and dashboard layout. These
                    improve your experience but are not required.
                  </p>
                </div>
              </div>
            </div>

            {/* What we don't do */}
            <div>
              <h2 className="text-h4 font-bold text-slate-900 mb-5">What We Don&apos;t Do</h2>
              <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                <ul className="space-y-3">
                  {[
                    'No advertising or tracking cookies',
                    'No third-party marketing trackers',
                    'No selling or sharing cookie data with third parties',
                    'No cross-site tracking',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span className="text-body text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Managing cookies */}
            <div>
              <h2 className="text-h4 font-bold text-slate-900 mb-5">Managing Cookies</h2>
              <p className="text-body text-slate-600 leading-[1.8]">
                You can control cookies through your browser settings. Disabling essential cookies
                may affect your ability to use Reqflow. For analytics and preference cookies, you
                can opt out without losing core functionality.
              </p>
            </div>

            {/* Contact */}
            <div className="pt-8 border-t border-slate-200">
              <p className="text-body text-slate-600 leading-[1.8]">
                Questions about our cookie practices? Contact us at{' '}
                <a
                  href="mailto:privacy@reqflow.co"
                  className="text-blue-600 font-semibold no-underline"
                >
                  privacy@reqflow.co
                </a>
                . See also our{' '}
                <Link href="/privacy" className="text-blue-600 font-semibold no-underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </>
  );
}
