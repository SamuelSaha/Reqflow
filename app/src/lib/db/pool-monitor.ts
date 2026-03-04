/**
 * Database Connection Pool Monitoring
 * Provides real-time metrics and health checks for connection pools
 */

import { logger } from "../monitoring/logger";
import type postgres from "postgres";

export interface PoolMetrics {
  // Real metrics from pg_stat_activity
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  idleInTransaction: number;
  waitingConnections: number;

  // Configuration
  maxConnections: number;
  idleTimeout: number;
  connectTimeout: number;

  // Health
  utilizationPercent: number;
  isHealthy: boolean;
  warnings: string[];
}

export interface SlowQuery {
  query: string;
  duration: number;
  timestamp: Date;
  state: string;
}

/**
 * Get real-time connection pool metrics from PostgreSQL
 */
export async function getPoolMetrics(
  client: postgres.Sql,
  appName: string = "reqflow-api"
): Promise<PoolMetrics> {
  try {
    // Query pg_stat_activity for connection statistics
    const result = await client`
      SELECT
        COUNT(*) FILTER (WHERE application_name LIKE ${appName + "%"}) as total,
        COUNT(*) FILTER (WHERE state = 'active' AND application_name LIKE ${appName + "%"}) as active,
        COUNT(*) FILTER (WHERE state = 'idle' AND application_name LIKE ${appName + "%"}) as idle,
        COUNT(*) FILTER (WHERE state = 'idle in transaction' AND application_name LIKE ${appName + "%"}) as idle_in_transaction,
        COUNT(*) FILTER (WHERE wait_event_type IS NOT NULL AND application_name LIKE ${appName + "%"}) as waiting
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    const stats = result[0];

    // Get max_connections setting
    const maxResult = await client`
      SELECT setting::int as max_connections
      FROM pg_settings
      WHERE name = 'max_connections'
    `;

    const maxConnections = maxResult[0]?.max_connections || 100;
    const total = Number(stats.total) || 0;
    const utilizationPercent = (total / maxConnections) * 100;

    // Health checks
    const warnings: string[] = [];
    let isHealthy = true;

    if (utilizationPercent > 80) {
      warnings.push(`High connection usage: ${utilizationPercent.toFixed(1)}%`);
      isHealthy = false;
    }

    if (Number(stats.idle_in_transaction) > 5) {
      warnings.push(`${stats.idle_in_transaction} idle transactions detected`);
      isHealthy = false;
    }

    if (Number(stats.waiting) > 10) {
      warnings.push(`${stats.waiting} connections waiting for resources`);
      isHealthy = false;
    }

    return {
      totalConnections: total,
      activeConnections: Number(stats.active) || 0,
      idleConnections: Number(stats.idle) || 0,
      idleInTransaction: Number(stats.idle_in_transaction) || 0,
      waitingConnections: Number(stats.waiting) || 0,
      maxConnections,
      idleTimeout: 0, // Not available from pg_stat_activity
      connectTimeout: 0, // Not available from pg_stat_activity
      utilizationPercent,
      isHealthy,
      warnings,
    };
  } catch (error) {
    logger.error("Failed to get pool metrics", error as Error);

    // Return fallback metrics
    return {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      idleInTransaction: 0,
      waitingConnections: 0,
      maxConnections: 0,
      idleTimeout: 0,
      connectTimeout: 0,
      utilizationPercent: 0,
      isHealthy: false,
      warnings: ["Failed to fetch metrics"],
    };
  }
}

/**
 * Get slow queries currently running
 */
export async function getSlowQueries(
  client: postgres.Sql,
  thresholdMs: number = 1000
): Promise<SlowQuery[]> {
  try {
    const result = await client`
      SELECT
        query,
        EXTRACT(EPOCH FROM (NOW() - query_start)) * 1000 as duration_ms,
        query_start as timestamp,
        state
      FROM pg_stat_activity
      WHERE state = 'active'
        AND query NOT LIKE 'SELECT%pg_stat_activity%'
        AND EXTRACT(EPOCH FROM (NOW() - query_start)) * 1000 > ${thresholdMs}
      ORDER BY query_start ASC
      LIMIT 10
    `;

    return result.map((row) => ({
      query: row.query,
      duration: Number(row.duration_ms),
      timestamp: new Date(row.timestamp),
      state: row.state,
    }));
  } catch (error) {
    logger.error("Failed to get slow queries", error as Error);
    return [];
  }
}

/**
 * Kill idle connections that have been in transaction too long
 * Use with caution - can interrupt legitimate long-running transactions
 */
export async function killIdleInTransactionConnections(
  client: postgres.Sql,
  maxIdleSeconds: number = 300 // 5 minutes
): Promise<number> {
  try {
    const result = await client`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE state = 'idle in transaction'
        AND EXTRACT(EPOCH FROM (NOW() - state_change)) > ${maxIdleSeconds}
        AND pid != pg_backend_pid()
    `;

    const killedCount = result.length;
    if (killedCount > 0) {
      logger.warn("Killed idle in transaction connections", { count: killedCount });
    }

    return killedCount;
  } catch (error) {
    logger.error("Failed to kill idle connections", error as Error);
    return 0;
  }
}

/**
 * Get database connection limits and usage
 */
export async function getConnectionLimits(
  client: postgres.Sql
): Promise<{
  maxConnections: number;
  reservedConnections: number;
  availableConnections: number;
  currentConnections: number;
}> {
  try {
    const result = await client`
      SELECT
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'superuser_reserved_connections') as reserved_connections,
        (SELECT COUNT(*) FROM pg_stat_activity) as current_connections
    `;

    const row = result[0];
    const maxConnections = row.max_connections || 100;
    const reservedConnections = row.reserved_connections || 3;
    const currentConnections = Number(row.current_connections) || 0;
    const availableConnections = maxConnections - reservedConnections - currentConnections;

    return {
      maxConnections,
      reservedConnections,
      availableConnections,
      currentConnections,
    };
  } catch (error) {
    logger.error("Failed to get connection limits", error as Error);
    return {
      maxConnections: 0,
      reservedConnections: 0,
      availableConnections: 0,
      currentConnections: 0,
    };
  }
}

/**
 * Monitor pool health periodically
 * Call this from a background job or health check endpoint
 */
export async function monitorPoolHealth(client: postgres.Sql): Promise<void> {
  const metrics = await getPoolMetrics(client);
  const slowQueries = await getSlowQueries(client);
  const limits = await getConnectionLimits(client);

  // Log metrics
  logger.info("Database pool metrics", {
    ...metrics,
    limits,
    slowQueriesCount: slowQueries.length,
  });

  // Log slow queries
  if (slowQueries.length > 0) {
    logger.warn("Slow queries detected", {
      count: slowQueries.length,
      queries: slowQueries.map((q) => ({
        duration: q.duration,
        query: q.query.substring(0, 100), // Truncate for logging
      })),
    });
  }

  // Alert on critical conditions
  if (!metrics.isHealthy) {
    logger.error("Database pool unhealthy", {
      warnings: metrics.warnings,
      metrics,
    });
  }

  // Auto-kill stuck transactions if configured
  if (metrics.idleInTransaction > 10) {
    logger.warn("High idle in transaction count, considering cleanup", {
      count: metrics.idleInTransaction,
    });
    // Uncomment to enable auto-cleanup:
    // await killIdleInTransactionConnections(client, 300);
  }
}
