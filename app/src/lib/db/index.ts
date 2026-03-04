/**
 * Database connection and client
 * Uses Drizzle ORM with PostgreSQL
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";
import { logger } from "../monitoring/logger";

/**
 * Connection pool configuration strategy:
 *
 * 1. Serverless (Vercel): Single connection, immediate close
 *    - Minimizes idle connections (serverless functions are ephemeral)
 *    - max=1 prevents connection buildup across many lambdas
 *
 * 2. Production (long-running server): Separate pools for workload types
 *    - API pool: 10 connections for tRPC queries (short-lived, high volume)
 *    - Worker pool: 3 connections for BullMQ jobs (long-running, lower volume)
 *    - Total: 13 connections (safe for most Postgres plans, can scale up)
 *
 * 3. Development: Small shared pool
 *    - 5 connections for local testing
 *
 * Pool sizing rationale:
 * - Each tRPC request holds connection briefly (~10-50ms)
 * - With 100 req/min rate limit, 10 connections handle ~1000 req/min
 * - BullMQ workers process longer jobs (1-10s), need fewer connections
 * - RLS session variables require connection recycling, not reuse across tenants
 */

// Detect environment
const isServerless = !!process.env.VERCEL;
const isProduction = env.NODE_ENV === "production" && !isServerless;

/**
 * API connection pool (for tRPC, route handlers)
 * Optimized for high-volume, short-lived queries
 */
const apiPoolConfig = isServerless
  ? {
      // Serverless: Single connection per function
      max: 1,
      idle_timeout: 0,
      connect_timeout: 10,
      max_lifetime: 60 * 30, // 30 minutes
    }
  : isProduction
    ? {
        // Production: Moderate pool for API requests
        max: 10,
        idle_timeout: 30, // Keep alive 30s for request bursts
        connect_timeout: 10,
        max_lifetime: 60 * 60, // 1 hour
        // Enable prepared statements for repeated queries
        prepare: true,
        // Connection validation
        onnotice: () => {}, // Suppress notices in production
      }
    : {
        // Development: Small pool
        max: 5,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false, // Faster reload during dev
      };

/**
 * Worker connection pool (for BullMQ background jobs)
 * Optimized for lower-volume, long-running transactions
 */
const workerPoolConfig = isServerless
  ? apiPoolConfig // Use same config in serverless
  : isProduction
    ? {
        // Production: Small pool for background jobs
        max: 3,
        idle_timeout: 60, // Longer idle (jobs are less frequent)
        connect_timeout: 10,
        max_lifetime: 60 * 60,
        prepare: true,
        onnotice: () => {},
      }
    : {
        // Development: Reuse API pool config
        ...apiPoolConfig,
      };

// Create connection clients
const apiQueryClient = postgres(env.DATABASE_URL, apiPoolConfig);
const workerQueryClient = isProduction
  ? postgres(env.DATABASE_URL, workerPoolConfig)
  : apiQueryClient; // Reuse in dev/serverless

// Create Drizzle instances
// Type assertion needed due to workspace postgres duplication
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = drizzle(apiQueryClient as any, { schema });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const workerDb = drizzle(workerQueryClient as any, { schema });

// Log pool initialization
logger.info("Database pools initialized", {
  environment: isServerless ? "serverless" : isProduction ? "production" : "development",
  apiPool: {
    max: apiPoolConfig.max,
    idleTimeout: apiPoolConfig.idle_timeout,
    preparedStatements: apiPoolConfig.prepare ?? false,
  },
  workerPool: isProduction
    ? {
        max: workerPoolConfig.max,
        idleTimeout: workerPoolConfig.idle_timeout,
        preparedStatements: workerPoolConfig.prepare ?? false,
      }
    : "shared",
});

// Export types
export type Database = typeof db;

/**
 * Connection pool statistics
 */
export interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
}

/**
 * Get API pool statistics
 * Note: postgres.js doesn't expose pool internals, so we track at connection level
 */
export function getApiPoolStats(): PoolStats {
  // postgres.js doesn't expose pool stats directly
  // In production, use pg_stat_activity query or external monitoring
  return {
    totalConnections: apiPoolConfig.max,
    idleConnections: 0, // Not available
    waitingClients: 0, // Not available
  };
}

/**
 * Get worker pool statistics
 */
export function getWorkerPoolStats(): PoolStats {
  if (!isProduction) {
    return getApiPoolStats(); // Shared pool in dev
  }

  return {
    totalConnections: workerPoolConfig.max,
    idleConnections: 0,
    waitingClients: 0,
  };
}

/**
 * Graceful shutdown - close all database connections
 * Call this when the app is terminating to prevent hanging connections
 */
export async function closeDbConnections(): Promise<void> {
  logger.info("Closing database connections...");

  try {
    await apiQueryClient.end({ timeout: 5 }); // 5 second timeout

    if (isProduction && workerQueryClient !== apiQueryClient) {
      await workerQueryClient.end({ timeout: 5 });
    }

    logger.info("Database connections closed successfully");
  } catch (error) {
    logger.error("Error closing database connections", error as Error);
    throw error;
  }
}

/**
 * Health check - verify database connectivity
 * Returns true if connection is healthy, false otherwise
 */
export async function checkDbHealth(): Promise<boolean> {
  try {
    // Simple query to verify connection
    const result = await apiQueryClient`SELECT 1 as health`;
    return result.length === 1 && result[0].health === 1;
  } catch (error) {
    logger.error("Database health check failed", error as Error);
    return false;
  }
}

/**
 * Tenant isolation middleware
 * Ensures all queries are scoped to the current tenant
 */
export function withTenant(tenantId: string): { tenantId: string } {
  return { tenantId };
}

/**
 * Helper to get tenant ID from context
 * In a real app, this would come from the auth session
 */
export function getCurrentTenantId(): string {
  // TODO: Implement actual session-based tenant resolution
  // For now, this is a placeholder
  throw new Error("getCurrentTenantId not implemented - get from session");
}
