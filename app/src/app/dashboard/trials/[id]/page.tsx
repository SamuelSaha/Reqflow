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
  FlaskConical,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { RequestDetailSkeleton } from "@/components/dashboard/LoadingSkeletons";
import { getErrorMessage } from "@/lib/utils/error-messages";
import { TrialDecisionModal } from "@/components/dashboard/TrialDecisionModal";

export const dynamic = "force-dynamic";

export default function TrialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  const trial = trpc.trials.getById.useQuery({ id });

  if (trial.isLoading) {
    return <RequestDetailSkeleton />;
  }

  if (trial.error) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/trials"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to trials
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              {getErrorMessage(trial.error)}
            </p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => trial.refetch()} variant="outline">
                Try again
              </Button>
              <Link href="/dashboard/trials">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to trials
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const t = trial.data!;
  const daysRemaining = t.daysRemaining;

  // Urgency badge
  let urgencyBadge = { color: "bg-green-100 text-green-700 border-green-200", label: `${daysRemaining}d left` };
  if (daysRemaining <= 0) {
    urgencyBadge = { color: "bg-red-100 text-red-700 border-red-200", label: "Expired" };
  } else if (daysRemaining === 1) {
    urgencyBadge = { color: "bg-red-100 text-red-700 border-red-200", label: "1 day left" };
  } else if (daysRemaining <= 3) {
    urgencyBadge = { color: "bg-amber-100 text-amber-700 border-amber-200", label: `${daysRemaining}d left` };
  } else if (daysRemaining <= 7) {
    urgencyBadge = { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: `${daysRemaining}d left` };
  }

  const progressPercentage = Math.max(
    0,
    Math.min(
      100,
      ((differenceInDays(new Date(), new Date(t.startDate)) /
        differenceInDays(new Date(t.endDate), new Date(t.startDate))) *
        100)
    )
  );

  const successCriteria = (t.successCriteria as Array<{ metric: string; target: string; met?: boolean; actual?: string }>) || [];
  const remindersSent = (t.remindersSent as Array<{ type: string; date: string }>) || [];

  return (
    <>
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard/trials"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to trials
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">{t.toolName}</h1>
              <Badge className={urgencyBadge.color}>{urgencyBadge.label}</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Started {format(new Date(t.startDate), "MMM d, yyyy")} · Ends {format(new Date(t.endDate), "MMM d, yyyy")}
            </p>
          </div>
          {(t.status === "active" || t.status === "extended") && (
            <Button onClick={() => setShowDecisionModal(true)}>
              Make Decision
            </Button>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column (2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Trial Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Trial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Department</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {t.department?.name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Category</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {t.category || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Estimated Annual Cost</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {t.estimatedAnnualCost || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                    <Badge variant="outline" className="mt-1">
                      {t.status}
                    </Badge>
                  </div>
                </div>

                {t.description && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Description</p>
                    <p className="text-sm text-slate-700 mt-1">{t.description}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Timeline</p>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        daysRemaining <= 1
                          ? "bg-red-500"
                          : daysRemaining <= 3
                            ? "bg-amber-500"
                            : daysRemaining <= 7
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Started {format(new Date(t.startDate), "MMM d")}</span>
                    <span>Today</span>
                    <span>Ends {format(new Date(t.endDate), "MMM d")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Criteria */}
            {successCriteria.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Success Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {successCriteria.map((criterion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        {criterion.met === true ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : criterion.met === false ? (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        ) : (
                          <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{criterion.metric}</p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Target: {criterion.target}
                            {criterion.actual && ` · Actual: ${criterion.actual}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Decision History */}
            {t.decision && (
              <Card>
                <CardHeader>
                  <CardTitle>Decision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    {t.decision === "buy" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {t.decision === "extend" && <Clock className="h-5 w-5 text-blue-600" />}
                    {t.decision === "cancel" && <XCircle className="h-5 w-5 text-red-600" />}
                    <span className="font-medium text-slate-900 capitalize">{t.decision}</span>
                    {t.decisionDate && (
                      <span className="text-sm text-slate-500">
                        on {format(new Date(t.decisionDate), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  {t.decisionNotes && (
                    <p className="text-sm text-slate-700 pl-7">{t.decisionNotes}</p>
                  )}
                  {t.convertedRequest && (
                    <div className="pl-7 pt-2">
                      <Link href={`/dashboard/requests/${t.convertedRequestId}`}>
                        <Button variant="outline" size="sm">
                          View Purchase Request →
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className={`text-4xl font-bold ${
                    daysRemaining <= 1 ? "text-red-600" :
                    daysRemaining <= 3 ? "text-amber-600" :
                    daysRemaining <= 7 ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    {daysRemaining}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {daysRemaining === 1 ? "day" : "days"} remaining
                  </p>
                </div>
                <Badge className={`${urgencyBadge.color} w-full justify-center`}>
                  {urgencyBadge.label}
                </Badge>
              </CardContent>
            </Card>

            {/* Stakeholders */}
            {t.stakeholders && (t.stakeholders as Array<{ role: string }>).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stakeholders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(t.stakeholders as Array<{ role: string }>).map((stakeholder, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">{stakeholder.role}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reminders Sent */}
            {remindersSent.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reminders Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {remindersSent.map((reminder, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{reminder.type} reminder</span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(reminder.date), "MMM d")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      <TrialDecisionModal
        trialId={t.id}
        toolName={t.toolName}
        endDate={t.endDate}
        open={showDecisionModal}
        onOpenChange={setShowDecisionModal}
        onSuccess={() => trial.refetch()}
      />
    </>
  );
}
