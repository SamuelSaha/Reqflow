"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileNav } from "@/components/navigation/MobileNav";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-[72px] transition-all duration-300 px-6 md:px-12 lg:px-20 flex items-center justify-between",
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-transparent"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 no-underline">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
        <span className="text-[20px] font-bold text-slate-900">Reqflow</span>
      </Link>

      {/* Desktop Navigation */}
      <DesktopNav />

      {/* Right Side Actions */}
      <div className="flex items-center gap-5">
        <Link
          href="/login"
          className="hidden lg:block text-[15px] font-medium text-slate-600 no-underline hover:text-slate-900 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="hidden lg:block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-[15px] font-semibold no-underline hover:bg-blue-700 transition-colors"
        >
          Start Free Trial
        </Link>

        {/* Mobile Menu */}
        <MobileNav />
      </div>
    </header>
  );
}
