/**
 * Row-Level Security (RLS) Context Helper
 * Sets PostgreSQL session variables for RLS policy evaluation
 *
 * SAFETY: This module is designed for gradual rollout.
 * - If RLS is not enabled, setting context is a no-op
 * - If helper functions don't exist, queries still work (no RLS filtering)
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { logger } from "@/lib/monitoring/logger";
import { env } from "@/lib/env";

// Feature flag for RLS - set RLS_ENABLED=true when migration is complete
// Defaults to false for safe gradual rollout
const RLS_ENABLED = env.RLS_ENABLED === "true";

export interface RLSContext {
  tenantId: string;
  userId: string;
  role: string;
}

/**
 * Set the RLS context for the current database session
 * Must be called before any database operations that require tenant isolation
 *
 * SAFETY: If RLS_ENABLED is false, this is a no-op
 *
 * @param context - The RLS context containing tenant, user, and role info
 */
export async function setRLSContext(context: RLSContext): Promise<void> {
  if (!RLS_ENABLED) {
    return;
  }

  try {
    await db.execute(sql`
      SELECT set_config('app.current_tenant', ${context.tenantId}, false),
             set_config('app.current_user_id', ${context.userId}, false),
             set_config('app.current_user_role', ${context.role}, false)
    `);
  } catch (error) {
    // Log but don't throw - RLS might not be set up yet
    logger.warn("RLS context set failed (RLS may not be configured)", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Clear the RLS context (for cleanup or switching contexts)
 */
export async function clearRLSContext(): Promise<void> {
  if (!RLS_ENABLED) {
    return;
  }

  try {
    await db.execute(sql`
      SELECT set_config('app.current_tenant', '', false),
             set_config('app.current_user_id', '', false),
             set_config('app.current_user_role', '', false)
    `);
  } catch {
    // Silently ignore - cleanup is best-effort
  }
}

/**
 * Get the current RLS context from session variables
 * Useful for debugging and verification
 */
export async function getRLSContext(): Promise<{
  tenantId: string | null;
  userId: string | null;
  role: string | null;
}> {
  const result = await db.execute(sql`
    SELECT current_setting('app.current_tenant', true) as tenant_id,
           current_setting('app.current_user_id', true) as user_id,
           current_setting('app.current_user_role', true) as role
  `);

  const row = result[0] as { tenant_id: string | null; user_id: string | null; role: string | null } | undefined;

  return {
    tenantId: row?.tenant_id || null,
    userId: row?.user_id || null,
    role: row?.role || null,
  };
}

/**
 * Execute a callback with RLS context set, then clear it
 * Useful for isolated operations that need tenant context
 *
 * @param context - The RLS context
 * @param callback - The async function to execute with context
 * @returns The result of the callback
 */
export async function withRLSContext<T>(
  context: RLSContext,
  callback: () => Promise<T>
): Promise<T> {
  await setRLSContext(context);
  try {
    return await callback();
  } finally {
    await clearRLSContext();
  }
}

/**
 * Middleware to set RLS context for tRPC procedures
 * This should be called in the tRPC context creation
 */
export function createRLSMiddleware() {
  return async function rlsMiddleware(opts: {
    ctx: { session?: { tenantId?: string; userId?: string; role?: string } };
    next: () => Promise<unknown>;
  }) {
    const { session } = opts.ctx;

    if (session?.tenantId && session?.userId && session?.role) {
      await setRLSContext({
        tenantId: session.tenantId,
        userId: session.userId,
        role: session.role,
      });
    }

    return opts.next();
  };
}
