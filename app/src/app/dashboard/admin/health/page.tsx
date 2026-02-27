/**
 * Admin Health Dashboard
 * /dashboard/admin/health - System health monitoring
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Database,
  Server,
  HardDrive,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap,
  Mail,
  Calendar,
  CalendarClock,
  Bot,
  Cpu,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type HealthStatus = "healthy" | "degraded" | "unhealthy";

interface HealthCheckResult {
  status: HealthStatus;
  latency?: number;
  message?: string;
  details?: Record<string, unknown>;
}

interface QueueHealth {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

interface SystemHealth {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
    queues: HealthCheckResult & { details?: Record<string, QueueHealth> };
    storage: HealthCheckResult;
    integrations?: HealthCheckResult & {
      details?: {
        slack?: HealthCheckResult;
        quickbooks?: HealthCheckResult;
        xero?: HealthCheckResult;
        resend?: HealthCheckResult;
      };
    };
  };
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);

  return parts.join(" ");
}

function StatusIcon({ status }: { status: HealthStatus }) {
  switch (status) {
    case "healthy":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "degraded":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case "unhealthy":
      return <XCircle className="h-5 w-5 text-red-600" />;
  }
}

function StatusBadge({ status }: { status: HealthStatus }) {
  const variants: Record<HealthStatus, "default" | "secondary" | "destructive"> = {
    healthy: "default",
    degraded: "secondary",
    unhealthy: "destructive",
  };

  const colors: Record<HealthStatus, string> = {
    healthy: "bg-green-100 text-green-800 hover:bg-green-100",
    degraded: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    unhealthy: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge variant={variants[status]} className={colors[status]}>
      {status.toUpperCase()}
    </Badge>
  );
}

function LatencyBadge({ latency }: { latency?: number }) {
  if (latency === undefined) return null;

  const color =
    latency < 100
      ? "text-green-600"
      : latency < 500
        ? "text-yellow-600"
        : "text-red-600";

  return <span className={`text-sm font-mono ${color}`}>{latency}ms</span>;
}

const queueIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  "approval-timers": Clock,
  sync: RefreshCw,
  "ai-classification": Bot,
  "trial-reminders": Calendar,
  "renewal-reminders": CalendarClock,
};

export default function HealthDashboardPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch health");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealth();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              Failed to load health status
            </p>
            <p className="text-slate-600 text-sm mb-4">{error}</p>
            <Button onClick={handleRefresh}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">System Health</h2>
            <p className="text-slate-600 mt-1">
              Real-time monitoring of system components
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {health && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Overall Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusIcon status={health.status} />
                      <StatusBadge status={health.status} />
                    </div>
                  </div>
                  <Activity className="h-8 w-8 text-slate-300" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Uptime</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">
                      {formatUptime(health.uptime)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-slate-300" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Version</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">
                      v{health.version}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-slate-300" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Last Check</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {new Date(health.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <RefreshCw className="h-8 w-8 text-slate-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={health.checks.database.status} />
                    <div>
                      <StatusBadge status={health.checks.database.status} />
                      <p className="text-sm text-slate-600 mt-1">
                        {health.checks.database.message}
                      </p>
                    </div>
                  </div>
                  <LatencyBadge latency={health.checks.database.latency} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Redis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={health.checks.redis.status} />
                    <div>
                      <StatusBadge status={health.checks.redis.status} />
                      <p className="text-sm text-slate-600 mt-1">
                        {health.checks.redis.message}
                      </p>
                    </div>
                  </div>
                  <LatencyBadge latency={health.checks.redis.latency} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage (R2)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={health.checks.storage.status} />
                    <div>
                      <StatusBadge status={health.checks.storage.status} />
                      <p className="text-sm text-slate-600 mt-1">
                        {health.checks.storage.message}
                      </p>
                    </div>
                  </div>
                  <LatencyBadge latency={health.checks.storage.latency} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {health.checks.integrations?.details && (
                  <div className="space-y-3">
                    {(Object.entries(health.checks.integrations.details) as [string, HealthCheckResult][]).map(
                      ([name, result]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <StatusIcon status={result.status} />
                            <span className="text-sm font-medium capitalize">
                              {name}
                            </span>
                          </div>
                          <span className="text-sm text-slate-600">
                            {result.message}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
                {(!health.checks.integrations?.details || Object.keys(health.checks.integrations.details).length === 0) && (
                  <p className="text-slate-600">No integration data</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Queue Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {health.checks.queues.details ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(health.checks.queues.details).map(
                    ([name, queue]) => {
                      const Icon = queueIcons[name] || Activity;
                      const hasFailed = queue.failed > 0;

                      return (
                        <div
                          key={name}
                          className={`p-4 rounded-lg border ${
                            hasFailed
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="h-4 w-4 text-slate-600" />
                            <span className="font-medium text-sm capitalize">
                              {name.replace(/-/g, " ")}
                            </span>
                            {hasFailed && (
                              <AlertTriangle className="h-4 w-4 text-yellow-600 ml-auto" />
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-lg font-semibold text-slate-900">
                                {queue.waiting}
                              </p>
                              <p className="text-xs text-slate-600">Waiting</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-slate-900">
                                {queue.active}
                              </p>
                              <p className="text-xs text-slate-600">Active</p>
                            </div>
                            <div>
                              <p
                                className={`text-lg font-semibold ${
                                  hasFailed ? "text-yellow-600" : "text-slate-900"
                                }`}
                              >
                                {queue.failed}
                              </p>
                              <p className="text-xs text-slate-600">Failed</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <p className="text-slate-600">No queue data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono">GET /api/health</code>
                    <p className="text-xs text-slate-600 mt-1">
                      Overall system health (public)
                    </p>
                  </div>
                  <Badge variant="outline">Public</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono">GET /api/health/ping</code>
                    <p className="text-xs text-slate-600 mt-1">
                      Simple uptime check
                    </p>
                  </div>
                  <Badge variant="outline">Public</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono">GET /api/health/database</code>
                    <p className="text-xs text-slate-600 mt-1">
                      Database connectivity and latency
                    </p>
                  </div>
                  <Badge variant="secondary">Admin</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono">GET /api/health/queues</code>
                    <p className="text-xs text-slate-600 mt-1">
                      Queue job counts and status
                    </p>
                  </div>
                  <Badge variant="secondary">Admin</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono">
                      GET /api/health/integrations
                    </code>
                    <p className="text-xs text-slate-600 mt-1">
                      External service status
                    </p>
                  </div>
                  <Badge variant="secondary">Admin</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
