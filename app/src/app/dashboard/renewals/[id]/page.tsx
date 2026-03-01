"use client";

import { use, useState } from "react";
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
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { RequestDetailSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { getErrorMessage } from "@/lib/utils/error-messages";
import {
  getUrgencyBadgeClass,
  getReadinessBadgeClass,
} from "@/lib/utils/renewal-readiness";
import { RenewalCheckpointModal } from "@/components/dashboard/RenewalCheckpointModal";
import { RenewalDecisionModal } from "@/components/dashboard/RenewalDecisionModal";

export const dynamic = "force-dynamic";

export default function RenewalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<{ id: string; label: string; weight: number; completed: boolean; notes?: string; completedAt?: string } | null>(null);

  const renewal = trpc.renewals.getById.useQuery({ id });

  if (renewal.isLoading) {
    return <RequestDetailSkeleton />;
  }

  if (renewal.error) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/renewals"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to renewals
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(renewal.error)}
            </p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => renewal.refetch()} variant="outline">
                Try again
              </Button>
              <Link href="/dashboard/renewals">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to renewals
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const r = renewal.data!;
  const contract = r.contract;
  const vendor = contract?.vendor;
  const checkpoints = (r.readinessCheckpoints || []) as Array<{ id: string; label: string; weight: number; completed: boolean; notes?: string; completedAt?: string }>;

  const daysUntilDeadline = r.daysUntilDeadline;
  const progressPercentage = Math.max(
    0,
    Math.min(
      100,
      ((differenceInDays(new Date(), parseISO(r.renewalDate)) /
        differenceInDays(parseISO(r.noticeDeadline), parseISO(r.renewalDate))) *
        100)
    )
  );

  return (
    <>
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard/renewals"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to renewals
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">
                {vendor?.name || "Unknown Vendor"}
              </h1>
              <Badge className={getUrgencyBadgeClass(r.urgencyColor)}>
                {daysUntilDeadline < 0
                  ? "Overdue"
                  : daysUntilDeadline === 0
                    ? "Due today"
                    : daysUntilDeadline === 1
                      ? "1 day left"
                      : `${daysUntilDeadline}d left`}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {contract?.title || "Contract"} · Notice deadline: {format(parseISO(r.noticeDeadline), "MMM d, yyyy")}
            </p>
          </div>
          {(r.status === "upcoming" || r.status === "in_review") && (
            <Button onClick={() => setShowDecisionModal(true)}>
              Make Decision
            </Button>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column (2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Contract Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Vendor
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {vendor?.name || " - "}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Tool/Service
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {contract?.title || " - "}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Annual Value
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      €{contract?.totalValue ? parseFloat(contract.totalValue).toLocaleString("en") : " - "}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Status
                    </p>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {r.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Timeline to Notice Deadline
                  </p>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        daysUntilDeadline <= 1
                          ? "bg-red-500"
                          : daysUntilDeadline <= 3
                            ? "bg-amber-500"
                            : daysUntilDeadline <= 7
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Contract start</span>
                    <span>Today</span>
                    <span>Notice deadline</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Readiness Checkpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Readiness Checkpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checkpoints.map((checkpoint) => (
                    <div
                      key={checkpoint.id}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCheckpoint(checkpoint);
                        setShowCheckpointModal(true);
                      }}
                    >
                      {checkpoint.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {checkpoint.label}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Weight: {checkpoint.weight} points
                        </p>
                        {checkpoint.completed && checkpoint.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Completed {format(parseISO(checkpoint.completedAt), "MMM d, yyyy")}
                          </p>
                        )}
                        {checkpoint.notes && (
                          <p className="text-xs text-slate-600 mt-1 italic">
                            {checkpoint.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decision History */}
            {r.decision && (
              <Card>
                <CardHeader>
                  <CardTitle>Decision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-slate-900 capitalize">
                      {r.decision}
                    </span>
                    {r.decisionDate && (
                      <span className="text-sm text-slate-500">
                        on {format(new Date(r.decisionDate), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  {r.decisionNotes && (
                    <p className="text-sm text-slate-700 pl-7">{r.decisionNotes}</p>
                  )}
                  {r.savingsAmount && (
                    <p className="text-sm text-green-600 pl-7 font-medium">
                      Savings: {r.savingsAmount}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">
            {/* Readiness Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Readiness Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div
                    className={`text-4xl font-bold ${
                      r.readinessScore >= 60
                        ? "text-green-600"
                        : r.readinessScore >= 30
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {r.readinessScore}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">out of 100</p>
                </div>
                <Badge
                  className={`${getReadinessBadgeClass(r.readinessScore)} w-full justify-center`}
                >
                  {r.readinessScore === 100
                    ? "Ready"
                    : r.readinessScore >= 60
                      ? "On track"
                      : r.readinessScore >= 30
                        ? "In progress"
                        : "Not started"}
                </Badge>
              </CardContent>
            </Card>

            {/* Days Remaining Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Days Until Deadline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div
                    className={`text-4xl font-bold ${
                      daysUntilDeadline <= 1
                        ? "text-red-600"
                        : daysUntilDeadline <= 3
                          ? "text-amber-600"
                          : daysUntilDeadline <= 7
                            ? "text-yellow-600"
                            : "text-green-600"
                    }`}
                  >
                    {daysUntilDeadline}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {daysUntilDeadline === 1 ? "day" : "days"} remaining
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedCheckpoint && (
        <RenewalCheckpointModal
          renewalId={r.id}
          checkpoint={selectedCheckpoint}
          open={showCheckpointModal}
          onOpenChange={setShowCheckpointModal}
          onSuccess={() => renewal.refetch()}
        />
      )}

      <RenewalDecisionModal
        renewalId={r.id}
        vendorName={vendor?.name || "Unknown"}
        open={showDecisionModal}
        onOpenChange={setShowDecisionModal}
        onSuccess={() => renewal.refetch()}
      />
    </>
  );
}
