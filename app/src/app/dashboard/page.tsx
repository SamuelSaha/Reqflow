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
  TrendingUp,
  ArrowRight,
  AlertCircle,
  FlaskConical,
  Calendar as CalendarIcon,
} from "lucide-react";
import { StatsCardSkeleton, RequestListSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { getErrorMessage } from "@/lib/utils/error-messages";
import { STATUS_STYLES } from "@/lib/design/tokens";

export const dynamic = "force-dynamic";

const statusBadge = STATUS_STYLES;

export default function DashboardPage() {
  const stats = trpc.requests.stats.useQuery();
  const recentRequests = trpc.requests.myList.useQuery({ limit: 5 });
  const pendingApprovals = trpc.approvals.myQueue.useQuery({ status: "pending" });
  const activeTrials = trpc.trials.list.useQuery({ status: "active" });
  const renewalsStats = trpc.renewals.getDashboardStats.useQuery();

  // Count expiring soon trials (< 7 days)
  const expiringSoonCount = activeTrials.data?.filter(t => t.daysRemaining < 7).length || 0;

  // Count urgent renewals (red)
  const urgentRenewalsCount = renewalsStats.data?.red || 0;

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
      {(stats.isLoading || activeTrials.isLoading || renewalsStats.isLoading) && <StatsCardSkeleton count={5} />}

      {stats.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(stats.error)}
            </p>
            <Button onClick={() => stats.refetch()} variant="outline" className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {stats.data && activeTrials.data && renewalsStats.data && (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            title="Pending Requests"
            value={stats.data.myPending}
            icon={Clock}
            subtitle="Awaiting approval"
          />
          <StatCard
            title="My Requests"
            value={stats.data.myRequests}
            icon={FileText}
            subtitle="Total submitted"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.data.pendingApprovals}
            icon={CheckSquare}
            subtitle="Require your review"
            highlight={stats.data.pendingApprovals > 0}
          />
          <StatCard
            title="Active Trials"
            value={activeTrials.data.length}
            icon={FlaskConical}
            subtitle={expiringSoonCount > 0 ? `${expiringSoonCount} expiring soon` : "Being evaluated"}
            highlight={expiringSoonCount > 0}
          />
          <StatCard
            title="Upcoming Renewals"
            value={renewalsStats.data.total}
            icon={CalendarIcon}
            subtitle={urgentRenewalsCount > 0 ? `${urgentRenewalsCount} urgent` : "Next 90 days"}
            highlight={urgentRenewalsCount > 0}
          />
          <StatCard
            title="Approved This Month"
            value={`€${stats.data.approvedThisMonth.toLocaleString("en", { minimumFractionDigits: 0 })}`}
            icon={TrendingUp}
            subtitle="Total value approved"
          />
        </div>
      )}

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
            {recentRequests.isLoading && <RequestListSkeleton rows={3} />}

            {recentRequests.error && (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-slate-900 font-medium mb-1">
                  {getErrorMessage(recentRequests.error)}
                </p>
                <Button onClick={() => recentRequests.refetch()} variant="link" size="sm">
                  Try again
                </Button>
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
                  const badge = statusBadge[req.status as keyof typeof statusBadge] ?? statusBadge.draft;
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
            {pendingApprovals.isLoading && <RequestListSkeleton rows={3} />}

            {pendingApprovals.error && (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-slate-900 font-medium mb-1">
                  {getErrorMessage(pendingApprovals.error)}
                </p>
                <Button onClick={() => pendingApprovals.refetch()} variant="link" size="sm">
                  Try again
                </Button>
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
                {pendingApprovals.data.slice(0, 5).map((approval) => (
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
                    {(approval.context?.riskFlags?.length ?? 0) > 0 && (
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
  highlight,
}: {
  title: string;
  value: number | string;
  icon: typeof Clock;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "ring-2 ring-blue-200 bg-blue-50/30" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${highlight ? "text-blue-600" : "text-slate-600"}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${highlight ? "text-blue-700" : ""}`}>
          {value}
        </div>
        <p className="text-xs text-slate-600 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
