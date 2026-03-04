import Link from "next/link";
import { ArrowRight } from "lucide-react";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Integrations", href: "/integrations" },
  { label: "Changelog", href: "/changelog" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const resourceLinks = [
  { label: "Documentation", href: "/documentation" },
  { label: "API Reference", href: "/api-reference" },
  { label: "Security", href: "/security" },
  { label: "Status", href: "/status" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/privacy#cookies" },
];

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Main footer content */}
        <div className="py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="Reqflow home" className="group flex items-center gap-2.5 no-underline w-fit">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-h5 text-white">Reqflow</span>
            </Link>
            <p className="text-body-sm text-slate-400 max-w-[280px] leading-relaxed">
              Free procurement software for small teams that buy without a procurement
              department. From request to invoice, governed and trackable.
            </p>
          </div>

          {/* Link columns */}
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <span className="text-body-sm text-slate-500">
            &copy; 2026 Reqflow SAS. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {legalLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-body-sm text-slate-500 no-underline hover:text-white transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-body-sm font-semibold text-slate-300">
        {title}
      </span>
      <div className="flex flex-col gap-2.5">
        {links.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="text-body-sm text-slate-400 no-underline hover:text-white transition-colors duration-150 w-fit"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
