import Link from "next/link";
import { FileText, CheckSquare, LayoutDashboard } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-slate-900">
              Reqflow
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/requests"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <FileText className="h-4 w-4" />
                Requests
              </Link>
              <Link
                href="/dashboard/approvals"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <CheckSquare className="h-4 w-4" />
                Approvals
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
