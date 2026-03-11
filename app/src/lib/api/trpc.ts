/**
 * tRPC initialization and base procedures
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import superjson from "superjson";
import { db } from "../db";
import { getCurrentUser } from "../auth/session";
import type { User } from "../db/schema";
import { apiKeys } from "../db/schema";
import { logger } from "../monitoring/logger";
import { captureError } from "../monitoring/sentry";
import {
  checkApiRateLimit,
  checkMutationRateLimit,
} from "../security/rate-limit";
import { validateCSRFToken, getCSRFTokenFromRequest, setCSRFToken } from "../security/csrf";
import { setRLSContext, clearRLSContext } from "../security/rls-context";
import { cookies } from "next/headers";
import { eq, and, gt, isNull, or } from "drizzle-orm";

/**
 * Resolve a raw API key (Bearer token) to a user record.
 * Returns null if the key is missing, invalid, or expired.
 */
async function getUserFromApiKey(raw: string): Promise<User | null> {
  if (!raw.startsWith("rqf_")) return null;

  // SHA-256 hash of the raw key
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const now = new Date();

  const key = await db.query.apiKeys.findFirst({
    where: and(
      eq(apiKeys.keyHash, hashHex),
      or(isNull(apiKeys.expiresAt), gt(apiKeys.expiresAt, now))
    ),
    with: { user: true },
  });

  if (!key) return null;

  // Fire-and-forget: update lastUsedAt without blocking the request
  void db
    .update(apiKeys)
    .set({ lastUsedAt: now })
    .where(eq(apiKeys.id, key.id));

  return key.user as User;
}

/**
 * Context for all tRPC procedures
 * Contains user, tenant, and database access.
 *
 * Supports two auth methods:
 *  1. Cookie session (browser / web app)
 *  2. API key via `Authorization: Bearer rqf_<key>` (CLI / programmatic)
 */
export async function createTRPCContext(opts?: { req?: Request }) {
  let user: User | null = null;
  let isApiKeyAuth = false;

  // Check for API key in Authorization header first
  const authHeader = opts?.req?.headers.get("authorization");
  if (authHeader?.startsWith("Bearer rqf_")) {
    const rawKey = authHeader.slice("Bearer ".length);
    user = await getUserFromApiKey(rawKey);
    if (user) isApiKeyAuth = true;
  }

  // Fall back to cookie session
  if (!user) {
    user = await getCurrentUser();
  }

  return {
    db,
    user,
    tenantId: user?.tenantId ?? null,
    isApiKeyAuth,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Log all tRPC errors
    logger.error("tRPC error", error, {
      code: error.code,
      path: shape.data.path,
    });

    // Send INTERNAL_SERVER_ERROR to Sentry
    if (error.code === "INTERNAL_SERVER_ERROR") {
      captureError(error.cause || error, {
        trpcPath: shape.data.path,
        trpcCode: error.code,
      });
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Smart rate limiting middleware
 * - Queries: 100 per minute per user
 * - Mutations: 20 per minute per user
 */
const rateLimitMiddleware = t.middleware(async ({ ctx, next, path, type }) => {
  // Only apply to authenticated users
  if (ctx.user) {
    const identifier = `${ctx.user.id}:${path}`;

    // Use stricter rate limit for mutations
    const isMutation = type === "mutation";
    const result = isMutation
      ? await checkMutationRateLimit(identifier)
      : await checkApiRateLimit(identifier);

    if (!result.success) {
      logger.warn(`${isMutation ? "Mutation" : "Query"} rate limit exceeded`, {
        userId: ctx.user.id,
        path,
        type,
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
      });

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Try again in ${Math.ceil((result.reset - Date.now()) / 1000)}s.`,
      });
    }
  }

  return next();
});

/**
 * CSRF protection middleware
 * Validates CSRF token on all mutations to prevent cross-site attacks.
 * Skipped for API key authenticated requests (not cookie-based, not vulnerable to CSRF).
 */
const csrfMiddleware = t.middleware(async ({ ctx, next, type }) => {
  // Only validate mutations (state-changing operations)
  if (type === "mutation") {
    // API key auth is not cookie-based — CSRF doesn't apply
    if (ctx.isApiKeyAuth) {
      return next({ ctx });
    }

    // Skip CSRF in development — cross-site attacks don't apply on localhost
    if (process.env.NODE_ENV === "development") {
      return next({ ctx });
    }

    // Auto-provision CSRF cookie if session exists but cookie is missing
    // (handles users who logged in before CSRF was implemented)
    const cookieStore = await cookies();
    if (!cookieStore.get("csrf_token")?.value && ctx.user) {
      await setCSRFToken();
      // Still reject this request — client needs to retry with the new cookie
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "CSRF token provisioned. Please retry your request.",
      });
    }

    const csrfToken = await getCSRFTokenFromRequest();
    const isValid = await validateCSRFToken(csrfToken);

    if (!isValid) {
      logger.warn("CSRF validation failed", {
        userId: ctx.user?.id,
        hasToken: !!csrfToken,
      });

      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid CSRF token. Please refresh the page and try again.",
      });
    }
  }

  return next({ ctx });
});

/**
 * RLS (Row-Level Security) context middleware
 * Sets PostgreSQL session variables for database-level tenant isolation
 */
const rlsMiddleware = t.middleware(async ({ ctx, next }) => {
  if (ctx.user && ctx.tenantId) {
    await setRLSContext({
      tenantId: ctx.tenantId,
      userId: ctx.user.id,
      role: ctx.user.role,
    });
  }

  try {
    return next({ ctx });
  } finally {
    if (ctx.user && ctx.tenantId) {
      await clearRLSContext();
    }
  }
});

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication + rate limiting + CSRF protection + RLS
 * Automatically applies appropriate rate limits based on operation type:
 * - Queries: 100 per minute
 * - Mutations: 20 per minute
 * - Mutations also require valid CSRF token
 * - RLS context is set for database-level tenant isolation
 */
export const protectedProcedure = t.procedure
  .use(rateLimitMiddleware)
  .use(csrfMiddleware)
  .use(rlsMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.user || !ctx.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user as User,
        tenantId: ctx.tenantId as string,
      },
    });
  });

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});

/**
 * Finance procedure - requires finance or admin role
 */
export const financeProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "finance" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});

/**
 * Create router
 */
export const router = t.router;

/**
 * Middleware builder
 */
export const middleware = t.middleware;

/**
 * Merge routers
 */
export const mergeRouters = t.mergeRouters;
