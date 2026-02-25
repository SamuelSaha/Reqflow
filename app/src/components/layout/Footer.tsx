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
];

export function Footer() {
  return (
    <footer className="bg-[#0F172A] pt-16 pb-8 px-20 flex flex-col gap-12">
      <div className="flex gap-16">
        {/* Brand column */}
        <div className="w-[320px] flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 bg-blue-600 rounded-[7px] flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
            <span className="text-[20px] font-bold text-white">Reqflow</span>
          </Link>
          <p className="text-[14px] leading-[1.6] text-slate-400 max-w-[280px]">
            Free procurement software for small teams that buy without a
            procurement department. From request to invoice, governed and
            trackable.
          </p>
        </div>

        {/* Link columns */}
        <div className="flex-1 grid grid-cols-3 gap-16">
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
        </div>
      </div>

      <div className="w-full h-px bg-slate-800" />

      <div className="flex items-center justify-between">
        <span className="text-[13px] text-slate-400">
          &copy; 2026 Reqflow SAS. All rights reserved.
        </span>
        <div className="flex items-center gap-6">
          {legalLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[13px] text-slate-400 no-underline hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
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
    <div className="flex flex-col gap-4">
      <span className="text-[13px] font-bold text-slate-400 tracking-[0.5px]">
        {title}
      </span>
      {links.map(({ label, href }) => (
        <Link
          key={label}
          href={href}
          className="text-[14px] text-slate-400 no-underline hover:text-white transition-colors"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
