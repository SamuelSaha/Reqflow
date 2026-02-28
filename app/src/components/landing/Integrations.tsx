/**
 * Integrations Section
 * Show key integrations to reduce switching cost objection
 */

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const integrations = [
  {
    name: "Slack",
    description: "Request approvals without leaving Slack",
    logo: "/integrations/slack-logo.svg",
  },
  {
    name: "QuickBooks",
    description: "Sync invoices and vendors automatically",
    logo: "/integrations/quickbooks-logo.svg",
  },
  {
    name: "Xero",
    description: "Two-way sync with your accounting system",
    logo: "/integrations/xero-logo.svg",
  },
  {
    name: "Gmail",
    description: "Submit requests via email",
    logo: "/integrations/gmail-logo.svg",
  },
  {
    name: "Google Sheets",
    description: "Export reports to spreadsheets",
    logo: "/integrations/sheets-logo.svg",
  },
  {
    name: "Zapier",
    description: "Connect to 5,000+ other tools",
    logo: "/integrations/zapier-logo.svg",
  },
];

export function Integrations() {
  return (
    <Section background="slate" className="relative">
      <Container size="default">
        <div className="py-20 md:py-28">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-h2 text-slate-900 mb-4">
              Plugs into the tools you already use
            </h2>
            <p className="text-body-lg text-slate-600 max-w-2xl mx-auto">
              No need to switch accounting software or change your workflow. Reqflow integrates seamlessly.
            </p>
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Logo placeholder - using text for now */}
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                  <span className="text-xl font-semibold text-slate-700">
                    {integration.name.charAt(0)}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-body font-semibold text-slate-900 mb-2">
                  {integration.name}
                </h3>
                <p className="text-body-sm text-slate-600 leading-relaxed">
                  {integration.description}
                </p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="text-center mt-12">
            <p className="text-body text-slate-600">
              Plus webhooks and API access for custom integrations
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
