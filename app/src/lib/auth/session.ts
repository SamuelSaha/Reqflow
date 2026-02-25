/**
 * Session management utilities
 * Get current user, tenant, and permissions
 */

import { cache } from "react";
import { cookies } from "next/headers";
import { auth } from "./config";
import type { User } from "../db/schema";

/**
 * Get current session (cached per request)
 */
export const getSession = cache(async () => {
  try {
    const cookieStore = await cookies();
    const session = await auth.api.getSession({
      headers: {
        cookie: cookieStore.toString(),
      },
    });
    return session;
  } catch {
    return null;
  }
});

/**
 * Get current user with organization context
 * In development, falls back to a seeded dev user when no session
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();

  if (session?.user) {
    // Real session — look up user by Better Auth ID
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    const user = await db.query.users.findFirst({
      where: eq(users.betterAuthId, session.user.id),
    });

    return user || null;
  }

  // Dev bypass: return seed user when no session in development
  if (process.env.NODE_ENV === "development") {
    const { ensureDevSeed, DEV_USER_ADMIN_ID } = await import(
      "../db/dev-seed"
    );
    await ensureDevSeed();

    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    const devUser = await db.query.users.findFirst({
      where: eq(users.id, DEV_USER_ADMIN_ID),
    });

    return devUser || null;
  }

  return null;
}

/**
 * Get current tenant ID
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.tenantId || null;
}

/**
 * Require authentication
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized - authentication required");
  }
  return user;
}

/**
 * Require specific role
 */
export async function requireRole(
  allowedRoles: Array<"requester" | "manager" | "finance" | "admin">
): Promise<User> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role as any)) {
    throw new Error(
      `Forbidden - requires one of: ${allowedRoles.join(", ")}`
    );
  }

  return user;
}

/**
 * Check if user has permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Permission matrix
  const permissions: Record<string, string[]> = {
    // Request permissions
    "request.create": ["requester", "manager", "finance", "admin"],
    "request.view.own": ["requester", "manager", "finance", "admin"],
    "request.view.all": ["finance", "admin"],
    "request.approve": ["manager", "finance", "admin"],

    // Budget permissions
    "budget.view": ["requester", "manager", "finance", "admin"],
    "budget.edit": ["finance", "admin"],

    // User management
    "user.manage": ["admin"],

    // Settings
    "settings.manage": ["admin"],
  };

  const allowedRoles = permissions[permission] || [];
  return allowedRoles.includes(user.role);
}

/**
 * Check if MFA is required for user
 */
export async function isMFARequired(user: User): Promise<boolean> {
  // Finance and Admin roles require MFA
  return user.role === "finance" || user.role === "admin";
}
