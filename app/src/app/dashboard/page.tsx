"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import {
  Plus,
  FileText,
  CheckSquare,
  Clock,
  Loader2,
  TrendingUp,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-500" },
};

export default function DashboardPage() {
  const stats = trpc.requests.stats.useQuery();
  const recentRequests = trpc.requests.myList.useQuery({ limit: 5 });
  const pendingApprovals = trpc.approvals.myQueue.useQuery({ status: "pending" });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your purchase requests and approvals
          </p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Pending Requests"
          value={stats.data?.myPending}
          icon={Clock}
          subtitle="Awaiting approval"
          loading={stats.isLoading}
        />
        <StatCard
          title="My Requests"
          value={stats.data?.myRequests}
          icon={FileText}
          subtitle="Total submitted"
          loading={stats.isLoading}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.data?.pendingApprovals}
          icon={CheckSquare}
          subtitle="Require your review"
          loading={stats.isLoading}
          highlight={!!stats.data?.pendingApprovals && stats.data.pendingApprovals > 0}
        />
        <StatCard
          title="Approved This Month"
          value={
            stats.data
              ? `€${stats.data.approvedThisMonth.toLocaleString("en", { minimumFractionDigits: 0 })}`
              : undefined
          }
          icon={TrendingUp}
          subtitle="Total value approved"
          loading={stats.isLoading}
        />
      </div>

      {/* Two-column: recent requests + action required */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Your latest purchase requests</CardDescription>
            </div>
            <Link href="/dashboard/requests">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentRequests.isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            )}
            {recentRequests.data && recentRequests.data.length === 0 && (
              <div className="text-center py-6">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-600">No requests yet</p>
                <Link href="/dashboard/requests/new">
                  <Button variant="link" size="sm" className="mt-1">
                    Create your first request
                  </Button>
                </Link>
              </div>
            )}
            {recentRequests.data && recentRequests.data.length > 0 && (
              <div className="space-y-3">
                {recentRequests.data.map((req) => {
                  const badge = statusBadge[req.status] ?? statusBadge.draft;
                  return (
                    <Link
                      key={req.id}
                      href={`/dashboard/requests/${req.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                          {req.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.requestNumber} &middot;{" "}
                          €{parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Required */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Action Required</CardTitle>
              <CardDescription>Approvals waiting for your review</CardDescription>
            </div>
            <Link href="/dashboard/approvals">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingApprovals.isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            )}
            {pendingApprovals.data && pendingApprovals.data.length === 0 && (
              <div className="text-center py-6">
                <CheckSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-600">No pending approvals</p>
                <p className="text-xs text-slate-400 mt-1">You're all caught up</p>
              </div>
            )}
            {pendingApprovals.data && pendingApprovals.data.length > 0 && (
              <div className="space-y-3">
                {pendingApprovals.data.slice(0, 5).map((approval: any) => (
                  <Link
                    key={approval.id}
                    href="/dashboard/approvals"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                        {approval.request.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {approval.request.requester.name} &middot;{" "}
                        €{parseFloat(approval.request.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {approval.context?.riskFlags?.length > 0 && (
                      <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  loading,
  highlight,
}: {
  title: string;
  value: number | string | undefined;
  icon: typeof Clock;
  subtitle: string;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "ring-2 ring-blue-200 bg-blue-50/30" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${highlight ? "text-blue-600" : "text-slate-600"}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : (
          <div className={`text-2xl font-bold ${highlight ? "text-blue-700" : ""}`}>
            {value ?? 0}
          </div>
        )}
        <p className="text-xs text-slate-600 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
