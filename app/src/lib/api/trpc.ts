/**
 * tRPC initialization and base procedures
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import superjson from "superjson";
import { db } from "../db";
import { getCurrentUser, getCurrentTenantId } from "../auth/session";
import type { User } from "../db/schema";
import { logger } from "../monitoring/logger";
import { captureError } from "../monitoring/sentry";
import {
  checkApiRateLimit,
  checkMutationRateLimit,
} from "../security/rate-limit";
import { validateCSRFToken, getCSRFTokenFromRequest } from "../security/csrf";
import { setRLSContext, clearRLSContext } from "../security/rls-context";

/**
 * Context for all tRPC procedures
 * Contains user, tenant, and database access
 */
export async function createTRPCContext() {
  const user = await getCurrentUser();
  const tenantId = await getCurrentTenantId();

  return {
    db,
    user,
    tenantId,
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
 * Validates CSRF token on all mutations to prevent cross-site attacks
 */
const csrfMiddleware = t.middleware(async ({ ctx, next, type }) => {
  // Only validate mutations (state-changing operations)
  if (type === "mutation") {
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
