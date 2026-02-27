"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import {
  ChevronLeft,
  Building2,
  Calendar,
  AlertTriangle,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export const dynamic = "force-dynamic";

const statusStyles = {
  draft: { icon: Clock, label: "Draft", color: "bg-slate-100 text-slate-700" },
  active: { icon: CheckCircle, label: "Active", color: "bg-green-100 text-green-700" },
  expired: { icon: XCircle, label: "Expired", color: "bg-red-100 text-red-700" },
  cancelled: { icon: XCircle, label: "Cancelled", color: "bg-slate-100 text-slate-700" },
  renewed: { icon: CheckCircle, label: "Renewed", color: "bg-blue-100 text-blue-700" },
};

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contract = trpc.contracts.getById.useQuery({ id });

  if (contract.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (contract.isError || !contract.data) {
    return (
      <div className="max-w-3xl">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-slate-900">Contract not found</h2>
          <p className="text-sm text-slate-600 mt-2">
            This contract may have been deleted or you don't have permission to view it.
          </p>
          <Link href="/dashboard/contracts" className="mt-4 inline-block">
            <Button>Back to Contracts</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = statusStyles[contract.data.status as keyof typeof statusStyles];
  const StatusIcon = statusConfig.icon;

  const daysUntilDeadline = contract.data.noticeDeadline
    ? differenceInDays(new Date(contract.data.noticeDeadline), new Date())
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/dashboard/contracts"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Contracts
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {contract.data.title}
            </h1>
            <Badge className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
            {contract.data.autoRenew && (
              <Badge variant="outline">Auto-renew</Badge>
            )}
          </div>
          {contract.data.contractNumber && (
            <p className="text-sm text-slate-600 font-mono">
              {contract.data.contractNumber}
            </p>
          )}
        </div>
        <Link href={`/dashboard/contracts/${id}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Notice Deadline Alert */}
      {contract.data.noticeDeadline && daysUntilDeadline !== null && daysUntilDeadline <= 30 && daysUntilDeadline >= 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">
                  Notice Deadline Approaching
                </h3>
                <p className="text-sm text-orange-800 mt-1">
                  You must give notice by{" "}
                  <strong>{format(new Date(contract.data.noticeDeadline), "MMMM d, yyyy")}</strong>
                  {" "}({daysUntilDeadline} days) to avoid auto-renewal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Vendor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-slate-900">
            {contract.data.vendor.name}
          </p>
          {contract.data.vendor.website && (
            <a
              href={contract.data.vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {contract.data.vendor.website}
            </a>
          )}
        </CardContent>
      </Card>

      {/* Dates & Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dates & Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">Type</p>
              <p className="font-medium text-slate-900 capitalize">
                {contract.data.type}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Start Date</p>
              <p className="font-medium text-slate-900">
                {format(new Date(contract.data.startDate), "MMM d, yyyy")}
              </p>
            </div>
            {contract.data.endDate && (
              <div>
                <p className="text-sm text-slate-600">End Date</p>
                <p className="font-medium text-slate-900">
                  {format(new Date(contract.data.endDate), "MMM d, yyyy")}
                </p>
              </div>
            )}
            {contract.data.renewalDate && (
              <div>
                <p className="text-sm text-slate-600">Renewal Date</p>
                <p className="font-medium text-slate-900">
                  {format(new Date(contract.data.renewalDate), "MMM d, yyyy")}
                </p>
              </div>
            )}
            {contract.data.noticeDeadline && (
              <div>
                <p className="text-sm text-slate-600">Notice Deadline</p>
                <p className={`font-medium ${daysUntilDeadline !== null && daysUntilDeadline <= 30 ? "text-orange-600" : "text-slate-900"}`}>
                  {format(new Date(contract.data.noticeDeadline), "MMM d, yyyy")}
                </p>
                {daysUntilDeadline !== null && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {daysUntilDeadline} days from now
                  </p>
                )}
              </div>
            )}
            {contract.data.noticePeriodDays && (
              <div>
                <p className="text-sm text-slate-600">Notice Period</p>
                <p className="font-medium text-slate-900">
                  {contract.data.noticePeriodDays} days
                </p>
              </div>
            )}
            {contract.data.upliftCap && (
              <div>
                <p className="text-sm text-slate-600">Uplift Cap</p>
                <p className="font-medium text-slate-900">
                  {contract.data.upliftCap}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial */}
      {(contract.data.totalValue || contract.data.paymentTerms) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contract.data.totalValue && (
              <div>
                <p className="text-sm text-slate-600">Total Value</p>
                <p className="text-2xl font-bold text-slate-900">
                  {contract.data.currency} {parseFloat(contract.data.totalValue).toLocaleString()}
                </p>
              </div>
            )}
            {contract.data.paymentTerms && (
              <div>
                <p className="text-sm text-slate-600">Payment Terms</p>
                <p className="font-medium text-slate-900">
                  {contract.data.paymentTerms}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document */}
      {contract.data.documentUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contract Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={contract.data.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Contract PDF
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
