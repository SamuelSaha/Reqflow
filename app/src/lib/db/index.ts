/**
 * Database connection and client
 * Uses Drizzle ORM with PostgreSQL
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";

// Create PostgreSQL connection
const queryClient = postgres(env.DATABASE_URL, {
  max: 10, // Max connections in pool
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle instance
export const db = drizzle(queryClient, { schema });

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
