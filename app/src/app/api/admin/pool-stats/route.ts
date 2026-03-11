/**
 * Database Connection Pool Statistics API
 * Admin-only endpoint for monitoring pool health
 */

import { NextResponse } from "next/server";
import {
  getApiPoolMetrics,
  getWorkerPoolMetrics,
  getSlowQueries,
  getConnectionLimits,
} from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { logger } from "@/lib/monitoring/logger";

export const runtime = "nodejs"; // Need Node.js for pg_stat_activity queries
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pool-stats
 * Returns comprehensive database connection pool statistics
 */
export async function GET() {
  try {
    // Authenticate and check admin role
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all pool statistics in parallel
    const [apiMetrics, workerMetrics, slowQueries, limits] = await Promise.all([
      getApiPoolMetrics(),
      getWorkerPoolMetrics(),
      getSlowQueries(1000), // Queries over 1 second
      getConnectionLimits(),
    ]);

    // Calculate overall health
    const overallHealth = apiMetrics.isHealthy && workerMetrics.isHealthy;
    const allWarnings = [...apiMetrics.warnings, ...workerMetrics.warnings];

    return NextResponse.json({
      health: {
        isHealthy: overallHealth,
        warnings: allWarnings,
        timestamp: new Date().toISOString(),
      },
      limits: {
        maxConnections: limits.maxConnections,
        reservedConnections: limits.reservedConnections,
        availableConnections: limits.availableConnections,
        currentConnections: limits.currentConnections,
        utilizationPercent: (
          (limits.currentConnections / limits.maxConnections) *
          100
        ).toFixed(1),
      },
      apiPool: {
        name: "API Pool",
        metrics: apiMetrics,
        config: {
          purpose: "tRPC queries, route handlers (short-lived, high-volume)",
          environment: process.env.VERCEL ? "serverless" : "production",
        },
      },
      workerPool: {
        name: "Worker Pool",
        metrics: workerMetrics,
        config: {
          purpose: "BullMQ background jobs (long-running, lower-volume)",
          shared: process.env.VERCEL ? true : false,
        },
      },
      slowQueries: {
        count: slowQueries.length,
        threshold: "1000ms",
        queries: slowQueries.map((q) => ({
          duration: `${q.duration.toFixed(0)}ms`,
          query: q.query.substring(0, 200), // Truncate for display
          state: q.state,
          timestamp: q.timestamp.toISOString(),
        })),
      },
      recommendations: generateRecommendations(apiMetrics, workerMetrics, limits),
    });
  } catch (error) {
    logger.error("Failed to fetch pool stats", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch pool statistics" },
      { status: 500 }
    );
  }
}

/**
 * Generate optimization recommendations based on metrics
 */
function generateRecommendations(
  apiMetrics: Awaited<ReturnType<typeof getApiPoolMetrics>>,
  workerMetrics: Awaited<ReturnType<typeof getWorkerPoolMetrics>>,
  limits: Awaited<ReturnType<typeof getConnectionLimits>>
): string[] {
  const recommendations: string[] = [];

  // High connection usage
  const totalUtilization =
    (limits.currentConnections / limits.maxConnections) * 100;
  if (totalUtilization > 80) {
    recommendations.push(
      `⚠️ High connection usage (${totalUtilization.toFixed(1)}%). Consider upgrading database plan or enabling connection pooling.`
    );
  }

  // Idle in transaction
  if (apiMetrics.idleInTransaction > 5) {
    recommendations.push(
      `⚠️ ${apiMetrics.idleInTransaction} idle transactions detected. Review transaction handling in application code.`
    );
  }

  // Waiting connections
  if (apiMetrics.waitingConnections > 10) {
    recommendations.push(
      `⚠️ ${apiMetrics.waitingConnections} connections waiting. Increase pool size or optimize query performance.`
    );
  }

  // Low utilization
  if (totalUtilization < 20 && limits.maxConnections > 20) {
    recommendations.push(
      `ℹ️ Low connection usage (${totalUtilization.toFixed(1)}%). Pool size may be oversized.`
    );
  }

  // Connection pooler recommendation
  if (process.env.VERCEL && !process.env.DATABASE_POOLER_URL) {
    recommendations.push(
      `💡 Running on Vercel without connection pooler. Consider using Neon, Supabase, or PgBouncer for better serverless performance.`
    );
  }

  // All good
  if (recommendations.length === 0) {
    recommendations.push("✅ Connection pool is healthy. No action needed.");
  }

  return recommendations;
}
