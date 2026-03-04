/**
 * Health Check Utilities
 * System health monitoring for database, Redis, queues, and external services
 */

import { sql } from "drizzle-orm";
import { db } from "../db";
import { redisConnection } from "../queue/config";
import { Queue } from "bullmq";
import { QueueName, defaultQueueOptions } from "../queue/config";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { env } from "../env";
import * as Sentry from "@sentry/nextjs";

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface HealthCheckResult {
  status: HealthStatus;
  latency?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface SystemHealth {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
    queues: HealthCheckResult;
    storage: HealthCheckResult;
  };
}

export interface DetailedHealth extends SystemHealth {
  checks: {
    database: HealthCheckResult & {
      details?: {
        connections?: number;
        latency?: number;
      };
    };
    redis: HealthCheckResult & {
      details?: {
        connected?: boolean;
        latency?: number;
      };
    };
    queues: HealthCheckResult & {
      details?: Record<string, QueueHealth>;
    };
    storage: HealthCheckResult & {
      details?: {
        bucket?: string;
        region?: string;
      };
    };
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

export interface QueueHealth {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

const startTime = Date.now();

export function getUptime(): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

export function getVersion(): string {
  return process.env.npm_package_version || "1.0.0";
}

/**
 * Check database connectivity and latency
 * Includes connection pool statistics
 */
export async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Test connection
    await db.execute(sql`SELECT 1`);
    const latency = Date.now() - start;

    // Get pool stats (imported dynamically to avoid circular deps)
    const { getApiPoolStats, getWorkerPoolStats } = await import("../db");
    const apiPool = getApiPoolStats();
    const workerPool = getWorkerPoolStats();

    if (latency > 1000) {
      return {
        status: "degraded",
        latency,
        message: `Database slow: ${latency}ms`,
        details: {
          pools: {
            api: {
              maxConnections: apiPool.totalConnections,
            },
            worker: {
              maxConnections: workerPool.totalConnections,
            },
          },
        },
      };
    }

    return {
      status: "healthy",
      latency,
      message: "Connected",
      details: {
        pools: {
          api: {
            maxConnections: apiPool.totalConnections,
          },
          worker: {
            maxConnections: workerPool.totalConnections,
          },
        },
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Check Redis connectivity
 */
export async function checkRedis(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const redis = await import("ioredis");
    const client = new redis.default(env.REDIS_URL);

    await client.ping();
    const latency = Date.now() - start;

    await client.quit();

    if (latency > 500) {
      return {
        status: "degraded",
        latency,
        message: `Redis slow: ${latency}ms`,
      };
    }

    return {
      status: "healthy",
      latency,
      message: "Connected",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Check queue health and get job counts
 */
export async function checkQueues(): Promise<HealthCheckResult & { details: Record<string, QueueHealth> }> {
  const start = Date.now();
  const queueHealth: Record<string, QueueHealth> = {};
  let hasFailures = false;

  try {
    const queueNames = [
      QueueName.EMAIL,
      QueueName.APPROVAL_TIMERS,
      QueueName.SYNC,
      QueueName.AI_CLASSIFICATION,
      QueueName.TRIAL_REMINDERS,
      QueueName.RENEWAL_REMINDERS,
    ];

    await Promise.all(
      queueNames.map(async (name) => {
        const queue = new Queue(name, defaultQueueOptions);
        const counts = await queue.getJobCounts("waiting", "active", "completed", "failed", "delayed");

        queueHealth[name] = {
          name,
          waiting: counts.waiting || 0,
          active: counts.active || 0,
          completed: counts.completed || 0,
          failed: counts.failed || 0,
          delayed: counts.delayed || 0,
        };

        if (counts.failed && counts.failed > 10) {
          hasFailures = true;
        }

        await queue.close();
      })
    );

    const latency = Date.now() - start;

    if (hasFailures) {
      return {
        status: "degraded",
        latency,
        message: "Some queues have failed jobs",
        details: queueHealth,
      };
    }

    return {
      status: "healthy",
      latency,
      message: "All queues operational",
      details: queueHealth,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "Queue check failed",
      details: queueHealth,
    };
  }
}

/**
 * Check R2/S3 storage connectivity
 */
export async function checkStorage(): Promise<HealthCheckResult> {
  const start = Date.now();

  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    return {
      status: "degraded",
      message: "R2 not configured",
    };
  }

  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });

    await client.send(new HeadBucketCommand({ Bucket: env.R2_BUCKET_NAME }));
    const latency = Date.now() - start;

    return {
      status: "healthy",
      latency,
      message: "Bucket accessible",
      details: {
        bucket: env.R2_BUCKET_NAME,
        region: "auto",
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "Storage check failed",
    };
  }
}

/**
 * Check Slack integration
 */
export async function checkSlack(): Promise<HealthCheckResult> {
  if (!env.SLACK_CLIENT_ID || !env.SLACK_CLIENT_SECRET) {
    return {
      status: "degraded",
      message: "Slack not configured",
    };
  }

  return {
    status: "healthy",
    message: "Configured (connection not tested)",
  };
}

/**
 * Check QuickBooks integration
 */
export async function checkQuickBooks(): Promise<HealthCheckResult> {
  if (!env.QUICKBOOKS_CLIENT_ID || !env.QUICKBOOKS_CLIENT_SECRET) {
    return {
      status: "degraded",
      message: "QuickBooks not configured",
    };
  }

  return {
    status: "healthy",
    message: "Configured (connection not tested)",
  };
}

/**
 * Check Xero integration
 */
export async function checkXero(): Promise<HealthCheckResult> {
  if (!env.XERO_CLIENT_ID || !env.XERO_CLIENT_SECRET) {
    return {
      status: "degraded",
      message: "Xero not configured",
    };
  }

  return {
    status: "healthy",
    message: "Configured (connection not tested)",
  };
}

/**
 * Check Resend email service
 */
export async function checkResend(): Promise<HealthCheckResult> {
  if (!env.RESEND_API_KEY) {
    return {
      status: "degraded",
      message: "Resend not configured",
    };
  }

  return {
    status: "healthy",
    message: "Configured",
  };
}

/**
 * Get overall system health status
 */
export function getOverallStatus(checks: HealthCheckResult[]): HealthStatus {
  if (checks.some((c) => c.status === "unhealthy")) {
    return "unhealthy";
  }
  if (checks.some((c) => c.status === "degraded")) {
    return "degraded";
  }
  return "healthy";
}

/**
 * Report degraded/unhealthy status to Sentry
 */
export function reportHealthToSentry(health: SystemHealth): void {
  if (health.status !== "healthy" && env.SENTRY_DSN) {
    Sentry.captureMessage(`System ${health.status}`, {
      level: health.status === "unhealthy" ? "error" : "warning",
      extra: {
        checks: health.checks,
        uptime: health.uptime,
      },
    });
  }
}

/**
 * Full system health check (public endpoint)
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  const [database, redis, queues, storage] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkQueues(),
    checkStorage(),
  ]);

  const health: SystemHealth = {
    status: getOverallStatus([database, redis, queues, storage]),
    timestamp: new Date().toISOString(),
    uptime: getUptime(),
    version: getVersion(),
    checks: {
      database,
      redis,
      queues,
      storage,
    },
  };

  reportHealthToSentry(health);

  return health;
}

/**
 * Detailed health check (admin only)
 */
export async function getDetailedHealth(): Promise<DetailedHealth> {
  const [database, redis, queues, storage] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkQueues(),
    checkStorage(),
  ]);

  const [slack, quickbooks, xero, resend] = await Promise.all([
    checkSlack(),
    checkQuickBooks(),
    checkXero(),
    checkResend(),
  ]);

  const allChecks = [database, redis, queues, storage, slack, quickbooks, xero, resend];

  const health: DetailedHealth = {
    status: getOverallStatus(allChecks),
    timestamp: new Date().toISOString(),
    uptime: getUptime(),
    version: getVersion(),
    checks: {
      database,
      redis,
      queues,
      storage,
      integrations: {
        status: getOverallStatus([slack, quickbooks, xero, resend]),
        message: "Integration status",
        details: {
          slack,
          quickbooks,
          xero,
          resend,
        },
      },
    },
  };

  reportHealthToSentry(health);

  return health;
}
