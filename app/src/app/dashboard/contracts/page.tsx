"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import {
  Plus,
  FileText,
  AlertCircle,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyBoxIllustration } from "@/components/ui/illustrations";

export const dynamic = "force-dynamic";

type StatusFilter = "all" | "active" | "draft" | "expired" | "cancelled" | "renewed";

const statusStyles = {
  draft: { icon: Clock, label: "Draft", color: "bg-slate-100 text-slate-700" },
  active: { icon: CheckCircle, label: "Active", color: "bg-green-100 text-green-700" },
  expired: { icon: XCircle, label: "Expired", color: "bg-red-100 text-red-700" },
  cancelled: { icon: XCircle, label: "Cancelled", color: "bg-slate-100 text-slate-700" },
  renewed: { icon: CheckCircle, label: "Renewed", color: "bg-blue-100 text-blue-700" },
};

export default function ContractsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showUpcomingDeadlines, setShowUpcomingDeadlines] = useState(false);

  const contractsList = trpc.contracts.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    showUpcomingDeadlines,
  });

  const activeContracts = contractsList.data?.filter(c => c.status === "active") ?? [];

  // Calculate deadline urgency
  const getDeadlineUrgency = (deadlineDate: string | null) => {
    if (!deadlineDate) return null;
    const daysUntil = differenceInDays(new Date(deadlineDate), new Date());
    if (daysUntil < 0) return { level: "overdue", color: "text-red-600", icon: AlertCircle };
    if (daysUntil <= 7) return { level: "critical", color: "text-red-600", icon: AlertCircle };
    if (daysUntil <= 30) return { level: "warning", color: "text-orange-600", icon: AlertTriangle };
    if (daysUntil <= 60) return { level: "upcoming", color: "text-blue-600", icon: Calendar };
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contracts</h1>
          <p className="text-slate-600 mt-2">
            Manage contracts and track notice deadlines
          </p>
        </div>
        <Link href="/dashboard/contracts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {activeContracts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Contracts</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {activeContracts.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Auto-Renewing</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {activeContracts.filter(c => c.autoRenew).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Notice Deadlines (30d)</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {
                      activeContracts.filter((c) => {
                        if (!c.noticeDeadline) return false;
                        const daysUntil = differenceInDays(
                          new Date(c.noticeDeadline),
                          new Date()
                        );
                        return daysUntil >= 0 && daysUntil <= 30;
                      }).length
                    }
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "draft" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("draft")}
            >
              Draft
            </Button>
            <Button
              variant={statusFilter === "expired" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("expired")}
            >
              Expired
            </Button>
            <Button
              variant={statusFilter === "cancelled" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("cancelled")}
            >
              Cancelled
            </Button>
            <div className="ml-auto">
              <Button
                variant={showUpcomingDeadlines ? "default" : "outline"}
                size="sm"
                onClick={() => setShowUpcomingDeadlines(!showUpcomingDeadlines)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Upcoming Deadlines
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {contractsList.isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-sm text-slate-600">Loading contracts...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {contractsList.isError && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-900">
                Failed to load contracts
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {contractsList.error.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {contractsList.data && contractsList.data.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              illustration={<EmptyBoxIllustration className="w-32 h-32" />}
              title="No contracts yet"
              description="Create your first contract to track terms, renewal dates, and notice deadlines."
              action={{
                label: "Create Contract",
                href: "/dashboard/contracts/new",
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Contracts List */}
      {contractsList.data && contractsList.data.length > 0 && (
        <div className="space-y-3">
          {contractsList.data.map((contract) => {
            const statusConfig = statusStyles[contract.status as keyof typeof statusStyles];
            const StatusIcon = statusConfig.icon;
            const urgency = contract.noticeDeadline ? getDeadlineUrgency(contract.noticeDeadline) : null;
            const UrgencyIcon = urgency?.icon;

            return (
              <Link key={contract.id} href={`/dashboard/contracts/${contract.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Title and Status */}
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {contract.title}
                          </h3>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          {contract.autoRenew && (
                            <Badge variant="outline" className="text-xs">
                              Auto-renew
                            </Badge>
                          )}
                        </div>

                        {/* Vendor */}
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                          <Building2 className="h-4 w-4" />
                          <span>{contract.vendor.name}</span>
                          {contract.contractNumber && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="font-mono">{contract.contractNumber}</span>
                            </>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Start:</span>{" "}
                            <span className="font-medium text-slate-900">
                              {format(new Date(contract.startDate), "MMM d, yyyy")}
                            </span>
                          </div>
                          {contract.endDate && (
                            <div>
                              <span className="text-slate-600">End:</span>{" "}
                              <span className="font-medium text-slate-900">
                                {format(new Date(contract.endDate), "MMM d, yyyy")}
                              </span>
                            </div>
                          )}
                          {contract.noticeDeadline && (
                            <div className="flex items-center gap-1">
                              {UrgencyIcon && <UrgencyIcon className={`h-4 w-4 ${urgency?.color}`} />}
                              <span className="text-slate-600">Notice Deadline:</span>{" "}
                              <span className={`font-medium ${urgency?.color ?? "text-slate-900"}`}>
                                {format(new Date(contract.noticeDeadline), "MMM d, yyyy")}
                              </span>
                              <span className="text-xs text-slate-500 ml-1">
                                ({differenceInDays(new Date(contract.noticeDeadline), new Date())} days)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Value */}
                      {contract.totalValue && (
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Total Value</p>
                          <p className="text-lg font-bold text-slate-900">
                            {contract.currency} {parseFloat(contract.totalValue).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
