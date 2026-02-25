import Link from "next/link";
import { ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Integrations", href: "/integrations" },
  { label: "About", href: "/about" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-[72px] bg-white/95 backdrop-blur-sm border-b border-slate-200 px-20 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3 no-underline">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
        <span className="text-[20px] font-bold text-slate-900">Reqflow</span>
      </Link>

      <nav className="flex items-center gap-9">
        {navLinks.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="text-[15px] font-medium text-slate-600 no-underline hover:text-slate-900 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        <Link
          href="/beta"
          className="text-[15px] font-medium text-slate-600 no-underline hover:text-slate-900 transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/beta"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-[15px] font-semibold no-underline hover:bg-blue-700 transition-colors"
        >
          Get Started Free
        </Link>
      </div>
    </header>
  );
}
