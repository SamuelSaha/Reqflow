/**
 * Session management utilities
 * Uses lightweight custom auth for MVP
 */

export {
  getCurrentUser,
  getSession,
  signIn,
  signOut,
  createUser,
  hashPassword,
  refreshSession,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  cleanupExpiredRefreshTokens,
  completeMFAVerification,
} from "./simple-auth";

import type { User } from "../db/schema";

/**
 * Get current tenant ID — reads JWT claims directly, no DB round-trip.
 * tenantId is embedded in the session token at login and never changes.
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const { getSession } = await import("./simple-auth");
  const session = await getSession();
  return session?.tenantId ?? null;
}

/**
 * Require authentication
 */
export async function requireAuth(): Promise<User> {
  const { getCurrentUser } = await import("./simple-auth");
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

  if (!allowedRoles.includes(user.role as "requester" | "manager" | "finance" | "admin")) {
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
  const { getCurrentUser } = await import("./simple-auth");
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
