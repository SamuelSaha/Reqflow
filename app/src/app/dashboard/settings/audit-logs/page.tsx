"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/api/react";
import type { AuditLog } from "@/lib/db/schema/audit-logs";
import {
  FileText,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Activity,
  Box,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const dynamic = "force-dynamic";

// Date range presets
const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: null },
] as const;

// Action type constants (matching AuditAction in @/lib/monitoring/audit.ts)
const ACTION_TYPES = [
  // Request actions
  "request.created",
  "request.submitted",
  "request.approved",
  "request.rejected",
  "request.updated",
  "request.deleted",
  // Approval actions
  "approval.decided",
  "approval.delegated",
  // Budget actions
  "budget.created",
  "budget.updated",
  "budget.deleted",
  "budget.allocated",
  // User/Team actions
  "user.invited",
  "user.created",
  "user.updated",
  "user.deactivated",
  "user.reactivated",
  "invite.resent",
  "invite.revoked",
  // Department actions
  "department.created",
  "department.updated",
  "department.deleted",
  // Trial actions
  "trial.started",
  "trial.extended",
  "trial.converted",
  "trial.expired",
  "trial.checkpoint.updated",
  // Renewal actions
  "renewal.decision",
  "renewal.checkpoint.updated",
  // Vendor actions
  "vendor.created",
  "vendor.updated",
  "vendor.auto_created",
  "vendor.compliance_doc.uploaded",
  // Organization actions
  "org.settings.updated",
  "org.plan.changed",
  // File actions
  "file.uploaded",
  "file.downloaded",
  "file.deleted",
] as const;

// Entity type constants
const ENTITY_TYPES = [
  "request",
  "approval",
  "budget",
  "user",
  "department",
  "trial",
  "renewal",
  "vendor",
  "organization",
  "file",
] as const;

export default function AuditLogsPage() {
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);

  // Filter state
  const [datePreset, setDatePreset] = useState<number | null>(7);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedAction, setSelectedAction] = useState<string | undefined>();
  const [selectedEntityType, setSelectedEntityType] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  // Compute date range from preset
  const { dateFrom, dateTo } = useMemo(() => {
    if (datePreset === null) {
      return { dateFrom: undefined, dateTo: undefined };
    }
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - datePreset);
    return { dateFrom: from, dateTo: now };
  }, [datePreset]);

  // Fetch audit logs with filters
  const auditLogsQuery = trpc.analytics.auditLogs.useQuery({
    page,
    pageSize,
    dateFrom,
    dateTo,
    userId: selectedUserId,
    action: selectedAction,
    entityType: selectedEntityType,
    search: searchQuery || undefined,
  });

  // Fetch users for filter dropdown
  const usersQuery = trpc.team.listUsers.useQuery({});

  // Export mutation
  const exportMutation = trpc.analytics.exportAuditLogs.useQuery(
    {
      dateFrom,
      dateTo,
      userId: selectedUserId,
      action: selectedAction,
      entityType: selectedEntityType,
      search: searchQuery || undefined,
    },
    {
      enabled: false,
    }
  );

  // Handle export to CSV
  const handleExport = async () => {
    try {
      const data = await exportMutation.refetch();
      if (!data.data) {
        toast.error("No data to export");
        return;
      }

      const csv = convertToCSV(data.data);
      downloadCSV(csv, `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
      toast.success("Audit logs exported");
    } catch (error) {
      toast.error("Failed to export audit logs");
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setDatePreset(7);
    setSelectedUserId(undefined);
    setSelectedAction(undefined);
    setSelectedEntityType(undefined);
    setSearchQuery("");
    setPage(1);
  };

  const hasFilters =
    datePreset !== 7 ||
    selectedUserId ||
    selectedAction ||
    selectedEntityType ||
    searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete audit trail of all system actions for SOC2 compliance
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
            {hasFilters && (
              <Button onClick={handleResetFilters} variant="ghost" size="sm">
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* First row: Date range and search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-range" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </Label>
              <Select
                value={datePreset?.toString() ?? "all"}
                onValueChange={(value) =>
                  setDatePreset(value === "all" ? null : parseInt(value))
                }
              >
                <SelectTrigger id="date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_PRESETS.map((preset) => (
                    <SelectItem
                      key={preset.label}
                      value={preset.days?.toString() ?? "all"}
                    >
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Entity ID
              </Label>
              <Input
                id="search"
                placeholder="Search by entity ID or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
              />
            </div>
          </div>

          {/* Second row: User, Action, Entity Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                User
              </Label>
              <Select
                value={selectedUserId ?? "all"}
                onValueChange={(value) => {
                  setSelectedUserId(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="user">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {usersQuery.data?.map((user: { id: string; name: string; email: string }) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Action
              </Label>
              <Select
                value={selectedAction ?? "all"}
                onValueChange={(value) => {
                  setSelectedAction(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {ACTION_TYPES.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity-type" className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                Entity Type
              </Label>
              <Select
                value={selectedEntityType ?? "all"}
                onValueChange={(value) => {
                  setSelectedEntityType(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="entity-type">
                  <SelectValue placeholder="All entity types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entity types</SelectItem>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Audit Trail
            </CardTitle>
            {auditLogsQuery.data && (
              <p className="text-sm text-slate-600">
                {auditLogsQuery.data.pagination.totalCount} total entries
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {auditLogsQuery.isLoading ? (
            <div className="text-center py-8 text-slate-600">Loading...</div>
          ) : auditLogsQuery.isError ? (
            <div className="text-center py-8 text-red-600">
              Error loading audit logs
            </div>
          ) : auditLogsQuery.data?.logs.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              No audit logs found
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="pb-3 text-sm font-medium text-slate-700">
                        Timestamp
                      </th>
                      <th className="pb-3 text-sm font-medium text-slate-700">
                        User
                      </th>
                      <th className="pb-3 text-sm font-medium text-slate-700">
                        Action
                      </th>
                      <th className="pb-3 text-sm font-medium text-slate-700">
                        Entity
                      </th>
                      <th className="pb-3 text-sm font-medium text-slate-700">
                        Description
                      </th>
                      <th className="pb-3 text-sm font-medium text-slate-700">
                        Changes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogsQuery.data?.logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 text-sm text-slate-600">
                          {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                        </td>
                        <td className="py-3 text-sm">
                          <div>
                            <div className="font-medium text-slate-900">
                              {log.userName || "System"}
                            </div>
                            <div className="text-xs text-slate-600">
                              {log.userEmail}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm">
                          <Badge variant="outline" className="font-mono text-xs">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm">
                          <div>
                            <div className="font-medium text-slate-900">
                              {log.entityType}
                            </div>
                            {log.entityId && (
                              <div className="text-xs text-slate-600 font-mono">
                                {log.entityId.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-sm text-slate-700">
                          {log.description || "-"}
                        </td>
                        <td className="py-3 text-sm">
                          {log.before || log.after ? (
                            <AuditLogDiff before={log.before} after={log.after} />
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {auditLogsQuery.data && auditLogsQuery.data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Page {auditLogsQuery.data.pagination.page} of{" "}
                    {auditLogsQuery.data.pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      onClick={() =>
                        setPage((p) =>
                          Math.min(auditLogsQuery.data!.pagination.totalPages, p + 1)
                        )
                      }
                      disabled={
                        page === auditLogsQuery.data.pagination.totalPages
                      }
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Component to display before/after diff in audit logs
 * Collapsible to save space
 */
function AuditLogDiff({
  before,
  after,
}: {
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto py-1 px-2">
          <span className="text-xs text-blue-600">View diff</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="rounded-md bg-slate-50 p-3 space-y-2 text-xs font-mono">
          {before && (
            <div>
              <div className="font-semibold text-red-700 mb-1">Before:</div>
              <pre className="text-red-600 whitespace-pre-wrap">
                {JSON.stringify(before, null, 2)}
              </pre>
            </div>
          )}
          {after && (
            <div>
              <div className="font-semibold text-green-700 mb-1">After:</div>
              <pre className="text-green-600 whitespace-pre-wrap">
                {JSON.stringify(after, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function convertToCSV(logs: AuditLog[]): string {
  const headers = [
    "Timestamp",
    "User Name",
    "User Email",
    "Action",
    "Entity Type",
    "Entity ID",
    "Description",
    "IP Address",
    "Before (JSON)",
    "After (JSON)",
  ];

  const rows = logs.map((log) => [
    format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
    log.userName || "",
    log.userEmail || "",
    log.action,
    log.entityType,
    log.entityId || "",
    log.description || "",
    log.ipAddress || "",
    log.before ? JSON.stringify(log.before) : "",
    log.after ? JSON.stringify(log.after) : "",
  ]);

  // Escape CSV fields
  const escapeCsvField = (field: string) => {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const csv = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => row.map(escapeCsvField).join(",")),
  ].join("\n");

  return csv;
}

/**
 * Download CSV file
 */
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
