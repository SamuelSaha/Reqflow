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
  FlaskConical,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

import { getErrorMessage } from "@/lib/utils/error-messages";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyTrialsIllustration, NoResultsIllustration } from "@/components/ui/illustrations";

export const dynamic = "force-dynamic";

type StatusFilter = "all" | "active" | "extended" | "converted" | "cancelled" | "expired";

const filters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "extended", label: "Extended" },
  { key: "converted", label: "Converted" },
  { key: "cancelled", label: "Cancelled" },
  { key: "expired", label: "Expired" },
];

export default function TrialsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const trials = trpc.trials.list.useQuery(
    statusFilter === "all" ? {} : { status: statusFilter }
  );

  // Get urgency badge config
  function getUrgencyBadge(daysRemaining: number) {
    if (daysRemaining <= 0) {
      return { color: "bg-red-100 text-red-700 border-red-200", label: "Expired" };
    } else if (daysRemaining === 1) {
      return { color: "bg-red-100 text-red-700 border-red-200", label: "1 day left" };
    } else if (daysRemaining <= 3) {
      return { color: "bg-amber-100 text-amber-700 border-amber-200", label: `${daysRemaining}d left` };
    } else if (daysRemaining <= 7) {
      return { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: `${daysRemaining}d left` };
    } else {
      return { color: "bg-green-100 text-green-700 border-green-200", label: `${daysRemaining}d left` };
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Trials
          </h1>
          <p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">
            Track tool trials and prevent shadow IT
          </p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Trial
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map(({ key, label }) => (
          <Button
            key={key}
            variant={statusFilter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Error state */}
      {trials.error && !trials.isLoading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(trials.error)}
            </p>
            <Button onClick={() => trials.refetch()} variant="outline" className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!trials.error && (!trials.data || trials.data.length === 0) && (
        <Card>
          <CardContent>
            <EmptyState
              illustration={
                statusFilter === "all" ? (
                  <EmptyTrialsIllustration className="w-32 h-32" />
                ) : (
                  <NoResultsIllustration className="w-32 h-32" />
                )
              }
              title={
                statusFilter === "all"
                  ? "No trials yet"
                  : `No ${statusFilter} trials`
              }
              description={
                statusFilter === "all"
                  ? "Start evaluating new tools with structured trials. Track success metrics and make data-driven decisions."
                  : `No ${statusFilter} trials found. Try adjusting your filters or start a new trial.`
              }
              action={
                statusFilter === "all"
                  ? {
                      label: "Start a Trial",
                      href: "/dashboard/requests/new",
                    }
                  : undefined
              }
              secondaryAction={
                statusFilter !== "all"
                  ? {
                      label: "Clear Filters",
                      onClick: () => setStatusFilter("all"),
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Trial list */}
      {trials.data && trials.data.length > 0 && (
        <div className="space-y-4">
          {trials.data.map((trial) => {
            const urgencyBadge = getUrgencyBadge(trial.daysRemaining);
            const progressPercentage = Math.max(
              0,
              Math.min(
                100,
                ((differenceInDays(new Date(), new Date(trial.startDate)) /
                  differenceInDays(new Date(trial.endDate), new Date(trial.startDate))) *
                  100)
              )
            );

            return (
              <Link key={trial.id} href={`/dashboard/trials/${trial.id}`}>
                <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4 text-blue-600" />
                          <CardTitle className="text-lg">{trial.toolName}</CardTitle>
                        </div>
                        <p className="text-sm text-slate-600">
                          {trial.department?.name || " - "} · {trial.category || " - "}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={urgencyBadge.color}>{urgencyBadge.label}</Badge>
                        <Badge variant="outline">
                          {trial.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Timeline Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Started {format(new Date(trial.startDate), "MMM d")}</span>
                        <span>Ends {format(new Date(trial.endDate), "MMM d")}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            trial.daysRemaining <= 1
                              ? "bg-red-500"
                              : trial.daysRemaining <= 3
                                ? "bg-amber-500"
                                : trial.daysRemaining <= 7
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Success Criteria Count */}
                    {trial.successCriteria && (trial.successCriteria as unknown[]).length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          {(trial.successCriteria as unknown[]).length} success{" "}
                          {(trial.successCriteria as unknown[]).length === 1 ? "criterion" : "criteria"}
                        </span>
                      </div>
                    )}

                    {/* Quick Action */}
                    {(trial.status === "active" || trial.status === "extended") && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-sm text-slate-600">Make a decision</span>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                    )}
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

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
