import { PageShell } from "@/components/layout";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="pt-20 pb-20 px-20">
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-h2 font-extrabold tracking-tight text-slate-900 mb-6">Contact Us</h1>
          <p className="text-body text-slate-600 leading-[1.7] mb-12">
            We're a small team in beta. Here's how to reach us:
          </p>

          <div className="grid gap-6 mb-12">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
              <h3 className="text-body-lg font-bold text-blue-600 mb-3">Beta Program Questions</h3>
              <p className="text-body text-slate-600 leading-[1.7] mb-4">Want to join the beta or have questions about the program?</p>
              <a href="mailto:beta@reqflow.co" className="text-blue-600 text-body font-semibold no-underline">beta@reqflow.co</a>
              <p className="text-caption text-slate-500 mt-3">We respond within 48 hours during business days (CET).</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
              <h3 className="text-body-lg font-bold text-blue-600 mb-3">Customer Support</h3>
              <p className="text-body text-slate-600 leading-[1.7] mb-4">Current beta customers can reach us via:</p>
              <p className="mb-3"><strong className="text-slate-900">Email:</strong>{" "}<a href="mailto:support@reqflow.co" className="text-blue-600 no-underline">support@reqflow.co</a></p>
              <p><strong className="text-slate-900">Shared Slack:</strong>{" "}<span className="text-slate-600">We add you to our customer Slack channel</span></p>
              <p className="text-caption text-slate-500 mt-3">Beta support: Best effort, 48h response time. We're hands-on during beta.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
              <h3 className="text-body-lg font-bold text-blue-600 mb-3">Security & Privacy</h3>
              <p className="text-body text-slate-600 leading-[1.7] mb-4">Security concerns or data inquiries:</p>
              <a href="mailto:security@reqflow.co" className="text-blue-600 text-body font-semibold no-underline">security@reqflow.co</a>
              <p className="text-caption text-slate-500 mt-3">See our <a href="/security" className="text-blue-600 no-underline">security page</a> for details on our practices.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
              <h3 className="text-body-lg font-bold text-blue-600 mb-3">Everything Else</h3>
              <p className="text-body text-slate-600 leading-[1.7] mb-4">Partnerships, press, general inquiries:</p>
              <a href="mailto:hello@reqflow.co" className="text-blue-600 text-body font-semibold no-underline">hello@reqflow.co</a>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-12">
            <h3 className="text-body-lg font-bold text-slate-900 mb-4">Company Information</h3>
            <div className="text-body text-slate-600 leading-[1.8] space-y-1">
              <p><strong className="text-slate-900">Legal name:</strong> Reqflow (in formation)</p>
              <p><strong className="text-slate-900">Location:</strong> Paris, France</p>
              <p><strong className="text-slate-900">Data hosting:</strong> EU (Paris) via Oracle Cloud + EU services</p>
              <p><strong className="text-slate-900">Status:</strong> Early beta (pre-incorporation)</p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
