"use client";

import { trpc } from "@/lib/api/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Clock, DollarSign, TrendingUp, Activity, Shield, Boxes } from "lucide-react";
import { format } from "date-fns";
import {
  AnalyticsStatSkeleton,
  ChartSkeleton,
} from "@/components/dashboard/LoadingSkeletons";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

// Lazy-load chart component for code splitting
const RequestTrendChart = dynamic(
  () => import("@/components/charts/RequestTrendChart").then((mod) => mod.RequestTrendChart),
  {
    loading: () => <ChartSkeleton height={300} />,
    ssr: false,
  }
);

export default function AnalyticsPage() {
  const overview = trpc.analytics.overview.useQuery();
  const trends = trpc.analytics.requestTrends.useQuery();
  const topUsers = trpc.analytics.topUsers.useQuery();
  const auditLogs = trpc.analytics.auditLogs.useQuery({});
  const authEvents = trpc.analytics.authEvents.useQuery({});
  const queueStats = trpc.analytics.queueStats.useQuery();

  const statCards = overview.data
    ? [
        {
          title: "Active Users",
          value: overview.data.activeUsers ?? 0,
          subtitle: "Last 30 days",
          icon: Users,
          color: "text-blue-600",
        },
        {
          title: "Request Volume",
          value: overview.data.requestVolume ?? 0,
          subtitle: "Last 30 days",
          icon: FileText,
          color: "text-green-600",
        },
        {
          title: "Avg Approval Time",
          value: `${overview.data.avgApprovalTimeHours ?? 0}h`,
          subtitle: "Last 7 days",
          icon: Clock,
          color: "text-orange-600",
        },
        {
          title: "Total Spend",
          value: `$${(overview.data.totalSpend ?? 0).toLocaleString()}`,
          subtitle: "Approved requests",
          icon: DollarSign,
          color: "text-violet-600",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-600 mt-1">
          System metrics, audit logs, and usage analytics
        </p>
      </div>

      {/* Overview Cards with component-level loading */}
      {overview.isLoading ? (
        <AnalyticsStatSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-slate-900">
                    {stat.value}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Top Users
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Activity className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="auth">
            <Shield className="h-4 w-4 mr-2" />
            Auth Events
          </TabsTrigger>
          <TabsTrigger value="queues">
            <Boxes className="h-4 w-4 mr-2" />
            Job Queues
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Request Volume Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {trends.isLoading ? (
                <ChartSkeleton height={300} />
              ) : trends.data && trends.data.length > 0 ? (
                <RequestTrendChart data={trends.data} height={300} />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Users by Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {topUsers.isLoading ? (
                <TableSkeleton columns={4} rows={5} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topUsers.data && topUsers.data.length > 0 ? (
                      topUsers.data.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">{user.userName}</span>
                              <span className="text-xs text-slate-500">{user.userEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.userRole}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {user.requestCount}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${user.totalAmount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500">
                          No user activity data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.isLoading ? (
                <TableSkeleton columns={4} rows={5} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.data && auditLogs.data.length > 0 ? (
                      auditLogs.data.slice(0, 20).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-slate-500">
                            {format(new Date(log.createdAt), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{log.userName}</span>
                              <span className="text-xs text-slate-500">{log.userEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {log.description}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500">
                          No audit logs yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auth Events Tab */}
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Recent Authentication Events</CardTitle>
            </CardHeader>
            <CardContent>
              {authEvents.isLoading ? (
                <TableSkeleton columns={4} rows={5} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authEvents.data && authEvents.data.length > 0 ? (
                      authEvents.data.slice(0, 20).map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-xs text-slate-500">
                            {format(new Date(event.createdAt), "MMM d, h:mm a")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {event.event}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={event.success ? "default" : "destructive"}>
                              {event.success ? "Success" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-mono text-slate-600">
                            {event.ipAddress || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500">
                          No auth events yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Queues Tab */}
        <TabsContent value="queues">
          <Card>
            <CardHeader>
              <CardTitle>BullMQ Job Queue Health</CardTitle>
            </CardHeader>
            <CardContent>
              {queueStats.isLoading ? (
                <TableSkeleton columns={5} rows={3} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Queue</TableHead>
                      <TableHead className="text-right">Waiting</TableHead>
                      <TableHead className="text-right">Active</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                      <TableHead className="text-right">Failed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queueStats.data && queueStats.data.length > 0 ? (
                      queueStats.data.map((queue) => (
                        <TableRow key={queue.name}>
                          <TableCell className="font-medium">{queue.name}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{queue.waiting}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="default">{queue.active}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-600 font-medium">{queue.completed}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            {queue.failed > 0 ? (
                              <Badge variant="destructive">{queue.failed}</Badge>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500">
                          No queue data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Table skeleton component for data tables
 */
function TableSkeleton({ columns, rows }: { columns: number; rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="flex-1">
              <Skeleton className="h-4 w-full max-w-[100px]" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
