"use client";

import { use } from "react";
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
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700 border-slate-200" },
  pending: { label: "Pending Approval", className: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Approved", className: "bg-green-100 text-green-700 border-green-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-500 border-slate-200" },
};

const decisionConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-100" },
  approved: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100" },
  rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-100" },
};

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const request = trpc.requests.getById.useQuery({ id });

  if (request.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (request.error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-lg font-medium text-slate-900">Request not found</p>
        <Link href="/dashboard/requests" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to requests
          </Button>
        </Link>
      </div>
    );
  }

  const req = request.data!;
  const status = statusConfig[req.status] ?? statusConfig.draft;

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/dashboard/requests"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to requests
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{req.title}</h1>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {req.requestNumber} &middot; Created{" "}
              {new Date(req.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              €{parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
            </p>
            {req.frequency !== "one-time" && (
              <p className="text-sm text-slate-500">{req.frequency}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content — 2 cols */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          {req.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Justification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{req.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Details grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={Building2} label="Department" value={req.department?.name ?? "—"} />
                <DetailItem icon={FileText} label="Category" value={req.category} />
                <DetailItem icon={DollarSign} label="Amount" value={`€${parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 2 })}`} />
                <DetailItem icon={Calendar} label="Frequency" value={req.frequency} />
                {req.vendorName && (
                  <DetailItem icon={Building2} label="Vendor" value={req.vendorName} />
                )}
                <DetailItem icon={AlertCircle} label="Urgency" value={req.urgency} />
                <DetailItem icon={User} label="Requester" value={req.requester?.name ?? "—"} />
                {req.submittedAt && (
                  <DetailItem
                    icon={Calendar}
                    label="Submitted"
                    value={new Date(req.submittedAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget info */}
          {req.budget && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {req.budget.name} ({req.budget.period})
                    </span>
                    <span className="font-medium">
                      €{parseFloat(req.budget.allocated).toLocaleString("en", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <BudgetBar budget={req.budget} requestAmount={parseFloat(req.amount)} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — approval chain */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Approval Chain
              </CardTitle>
            </CardHeader>
            <CardContent>
              {req.approvals && req.approvals.length > 0 ? (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-6 bottom-6 w-px bg-slate-200" />

                  <div className="space-y-6">
                    {req.approvals.map((approval: any, i: number) => {
                      const config = decisionConfig[approval.decision] ?? decisionConfig.pending;
                      const Icon = config.icon;
                      return (
                        <div key={approval.id} className="relative flex gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center z-10`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-medium text-slate-900">
                              {approval.approver?.name ?? "Unknown"}
                            </p>
                            <p className="text-xs text-slate-500">
                              Step {approval.step} &middot;{" "}
                              {approval.required === "required" ? "Required" : "Optional"}
                            </p>
                            {approval.decision !== "pending" && (
                              <p className="text-xs mt-1">
                                <span className={approval.decision === "approved" ? "text-green-600" : "text-red-600"}>
                                  {approval.decision === "approved" ? "Approved" : "Rejected"}
                                </span>
                                {approval.decidedAt && (
                                  <span className="text-slate-400 ml-1">
                                    on {new Date(approval.decidedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                            )}
                            {approval.comments && (
                              <p className="text-xs text-slate-600 mt-1 italic">
                                "{approval.comments}"
                              </p>
                            )}
                            {/* Risk flags from context */}
                            {approval.context?.riskFlags?.map((flag: string, j: number) => (
                              <Badge
                                key={j}
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] mt-1 mr-1"
                              >
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    {req.status === "draft"
                      ? "Submit to start the approval process"
                      : "No approval chain found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <TimelineEvent
                  label="Created"
                  date={req.createdAt}
                  active
                />
                <TimelineEvent
                  label="Submitted"
                  date={req.submittedAt}
                  active={!!req.submittedAt}
                />
                {req.status === "approved" && (
                  <TimelineEvent
                    label="Approved"
                    date={req.approvedAt}
                    active={!!req.approvedAt}
                    variant="success"
                  />
                )}
                {req.status === "rejected" && (
                  <TimelineEvent
                    label="Rejected"
                    date={req.rejectedAt}
                    active={!!req.rejectedAt}
                    variant="error"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900 capitalize">{value}</p>
      </div>
    </div>
  );
}

function BudgetBar({
  budget,
  requestAmount,
}: {
  budget: { allocated: string; committed: string; spent: string };
  requestAmount: number;
}) {
  const allocated = parseFloat(budget.allocated);
  const committed = parseFloat(budget.committed);
  const spent = parseFloat(budget.spent);
  const used = committed + spent;
  const utilization = allocated > 0 ? (used / allocated) * 100 : 0;
  const requestPct = allocated > 0 ? (requestAmount / allocated) * 100 : 0;

  return (
    <div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-slate-400 rounded-l-full"
          style={{ width: `${Math.min(utilization, 100)}%` }}
        />
        <div
          className={`h-full ${utilization + requestPct > 100 ? "bg-red-400" : "bg-blue-400"}`}
          style={{ width: `${Math.min(requestPct, 100 - utilization)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{utilization.toFixed(0)}% used</span>
        <span>+{requestPct.toFixed(1)}% this request</span>
        <span>€{(allocated - used).toLocaleString("en", { minimumFractionDigits: 0 })} remaining</span>
      </div>
    </div>
  );
}

function TimelineEvent({
  label,
  date,
  active,
  variant = "default",
}: {
  label: string;
  date: Date | string | null | undefined;
  active: boolean;
  variant?: "default" | "success" | "error";
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full ${
          !active
            ? "bg-slate-200"
            : variant === "success"
              ? "bg-green-500"
              : variant === "error"
                ? "bg-red-500"
                : "bg-blue-500"
        }`}
      />
      <div className="flex-1 flex justify-between">
        <span className={`text-sm ${active ? "text-slate-900" : "text-slate-400"}`}>
          {label}
        </span>
        {date && (
          <span className="text-xs text-slate-500">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
