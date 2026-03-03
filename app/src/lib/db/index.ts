/**
 * Database connection and client
 * Uses Drizzle ORM with PostgreSQL
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";
import { logger } from "../monitoring/logger";

// Serverless-optimized connection pooling
// Detect serverless environment (Vercel sets VERCEL=1)
const isServerless = !!process.env.VERCEL;

const poolConfig = isServerless
  ? {
      // Serverless: Single connection per function, close immediately
      max: 1,
      idle_timeout: 0, // Close immediately when done
      connect_timeout: 10,
      max_lifetime: 60 * 30, // Recycle after 30 min
    }
  : {
      // Local dev: Small pool for parallel queries
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    };

// Create PostgreSQL connection
const queryClient = postgres(env.DATABASE_URL, poolConfig);

// Log connection pool configuration (helps track serverless cold start behavior)
if (isServerless || env.NODE_ENV === "development") {
  logger.info("Database pool initialized", {
    mode: isServerless ? "serverless" : "dev",
    maxConnections: poolConfig.max,
    idleTimeout: poolConfig.idle_timeout,
  });
}

// Create Drizzle instance
// Type assertion needed due to workspace postgres duplication (TypeScript sees two postgres types)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = drizzle(queryClient as any, { schema });

// Export types
export type Database = typeof db;

/**
 * Tenant isolation middleware
 * Ensures all queries are scoped to the current tenant
 */
export function withTenant(
  tenantId: string
): { tenantId: string } {
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
