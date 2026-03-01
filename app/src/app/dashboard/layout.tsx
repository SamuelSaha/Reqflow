"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, CheckSquare, LayoutDashboard, Wallet, FlaskConical, Calendar, Settings, Building2, Menu, Package, Receipt } from "lucide-react";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNavigationPrefetch } from "@/hooks/useNavigationPrefetch";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Skip SSR for NotificationBell — Radix DropdownMenu generates mismatched
// IDs between server and client. No SEO value in a notification bell anyway.
const NotificationBell = dynamic(
  () => import("@/components/notifications/NotificationBell").then((m) => m.NotificationBell),
  { ssr: false }
);

// Note: route segment config (dynamic = "force-dynamic") only works in Server Components

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/requests", label: "Requests", icon: FileText, exact: false },
  { href: "/dashboard/approvals", label: "Approvals", icon: CheckSquare, exact: false },
  { href: "/dashboard/trials", label: "Trials", icon: FlaskConical, exact: false },
  { href: "/dashboard/renewals", label: "Renewals", icon: Calendar, exact: false },
  { href: "/dashboard/budgets", label: "Budgets", icon: Wallet, exact: false },
  { href: "/dashboard/subscriptions", label: "Subscriptions", icon: Package, exact: false },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt, exact: false },
  { href: "/dashboard/vendors", label: "Vendors", icon: Building2, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { prefetch } = useNavigationPrefetch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prefetch likely next pages on mount
  useNavigationPrefetchOnMount(prefetch, pathname);

  return (
    <div className="min-h-screen bg-[var(--warm-50)]">
      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-slate-900">
              Reqflow
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navItems.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact
                  ? pathname === href
                  : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onMouseEnter={() => prefetch(href)}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <NotificationBell />

              {/* Mobile hamburger */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-10 w-10 p-0"
                  suppressHydrationWarning
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  {navItems.map(({ href, label, icon: Icon, exact }) => {
                    const isActive = exact
                      ? pathname === href
                      : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 text-sm font-medium px-3 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

/**
 * Prefetch likely navigation targets based on current page
 */
function useNavigationPrefetchOnMount(
  prefetch: (href: string) => void,
  pathname: string
) {
   
  // Prefetch common destinations based on current page
  const prefetchMap: Record<string, string[]> = {
    "/dashboard": ["/dashboard/requests", "/dashboard/approvals"],
    "/dashboard/requests": ["/dashboard/requests/new", "/dashboard/approvals"],
    "/dashboard/approvals": ["/dashboard/requests", "/dashboard/trials"],
    "/dashboard/trials": ["/dashboard/approvals", "/dashboard/renewals"],
    "/dashboard/renewals": ["/dashboard/trials", "/dashboard/subscriptions"],
    "/dashboard/budgets": ["/dashboard/settings/budgets", "/dashboard/subscriptions"],
    "/dashboard/subscriptions": ["/dashboard/budgets", "/dashboard/invoices"],
    "/dashboard/invoices": ["/dashboard/subscriptions", "/dashboard/vendors"],
    "/dashboard/vendors": ["/dashboard/vendors/new", "/dashboard/requests"],
    "/dashboard/settings": ["/dashboard/settings/team", "/dashboard/settings/workflows"],
  };

   
  const routesToPrefetch = prefetchMap[pathname] || [];

  // Prefetch after short delay to avoid blocking initial render
  if (typeof window !== "undefined") {
    setTimeout(() => {
      routesToPrefetch.forEach(prefetch);
    }, 300);
  }
}
