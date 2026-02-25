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
  Loader2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

type StatusFilter = "all" | "draft" | "pending" | "approved" | "rejected";

const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700", icon: Edit3 },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700", icon: XCircle },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-500", icon: XCircle },
};

const filters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const requestList = trpc.requests.myList.useQuery(
    statusFilter === "all" ? {} : { status: statusFilter }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Requests
          </h1>
          <p className="text-slate-600 mt-2">
            View and manage your purchase requests
          </p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
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

      {/* Loading */}
      {requestList.isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* Empty state */}
      {requestList.data && requestList.data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900">
              {statusFilter === "all"
                ? "No requests yet"
                : `No ${statusFilter} requests`}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {statusFilter === "all"
                ? "Create your first purchase request to get started"
                : `You don't have any ${statusFilter} requests`}
            </p>
            {statusFilter === "all" && (
              <Link href="/dashboard/requests/new" className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Request list */}
      {requestList.data && requestList.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {requestList.data.length} request{requestList.data.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {requestList.data.map((req) => {
                const config = statusConfig[req.status] ?? statusConfig.draft;
                const StatusIcon = config.icon;
                return (
                  <Link
                    key={req.id}
                    href={`/dashboard/requests/${req.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      <StatusIcon className={`h-5 w-5 ${
                        req.status === "approved" ? "text-green-500" :
                        req.status === "rejected" ? "text-red-500" :
                        req.status === "pending" ? "text-amber-500" :
                        "text-slate-400"
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
                          {req.title}
                        </p>
                        <Badge variant="outline" className="text-[10px] py-0 flex-shrink-0">
                          {req.requestNumber}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.department?.name ?? "—"} &middot;{" "}
                        {req.category} &middot;{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                        {req.vendorName ? ` · ${req.vendorName}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          €{parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 2 })}
                        </p>
                        {req.frequency !== "one-time" && (
                          <p className="text-[10px] text-slate-500">{req.frequency}</p>
                        )}
                      </div>
                      <Badge className={config.className}>{config.label}</Badge>
                      <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
