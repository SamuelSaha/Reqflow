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
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
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
