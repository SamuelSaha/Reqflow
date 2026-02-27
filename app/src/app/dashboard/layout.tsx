"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, CheckSquare, LayoutDashboard, Wallet, FlaskConical, Calendar, Settings, Building2 } from "lucide-react";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNavigationPrefetch } from "@/hooks/useNavigationPrefetch";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/requests", label: "Requests", icon: FileText, exact: false },
  { href: "/dashboard/approvals", label: "Approvals", icon: CheckSquare, exact: false },
  { href: "/dashboard/trials", label: "Trials", icon: FlaskConical, exact: false },
  { href: "/dashboard/renewals", label: "Renewals", icon: Calendar, exact: false },
  { href: "/dashboard/budgets", label: "Budgets", icon: Wallet, exact: false },
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

  // Prefetch likely next pages on mount
  useNavigationPrefetchOnMount(prefetch, pathname);

  return (
    <div className="min-h-screen bg-[var(--warm-50)]">
      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-slate-900">
              Reqflow
            </Link>
            <nav className="flex items-center gap-1">
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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
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
  // eslint-disable-next-line no-console
  // Prefetch common destinations based on current page
  const prefetchMap: Record<string, string[]> = {
    "/dashboard": ["/dashboard/requests", "/dashboard/approvals"],
    "/dashboard/requests": ["/dashboard/requests/new", "/dashboard/approvals"],
    "/dashboard/approvals": ["/dashboard/requests", "/dashboard/trials"],
    "/dashboard/trials": ["/dashboard/approvals", "/dashboard/renewals"],
    "/dashboard/renewals": ["/dashboard/trials", "/dashboard/vendors"],
    "/dashboard/budgets": ["/dashboard/settings/budgets", "/dashboard/requests"],
    "/dashboard/vendors": ["/dashboard/vendors/new", "/dashboard/requests"],
    "/dashboard/settings": ["/dashboard/settings/team", "/dashboard/settings/workflows"],
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const routesToPrefetch = prefetchMap[pathname] || [];

  // Prefetch after short delay to avoid blocking initial render
  if (typeof window !== "undefined") {
    setTimeout(() => {
      routesToPrefetch.forEach(prefetch);
    }, 300);
  }
}
