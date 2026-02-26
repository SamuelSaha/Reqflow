/**
 * tRPC Integrations Router
 * Manages accounting integrations (QuickBooks, Xero)
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { accountingIntegrations, accountingSyncLogs } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createAuditLog, AuditAction } from "@/lib/monitoring/audit";

export const integrationsRouter = router({
  /**
   * List all active integrations for the current tenant
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const integrations = await ctx.db.query.accountingIntegrations.findMany({
      where: eq(accountingIntegrations.tenantId, ctx.tenantId),
      columns: {
        id: true,
        provider: true,
        providerAccountName: true,
        providerAccountId: true,
        isActive: true,
        autoSync: true,
        lastSyncedAt: true,
        lastSyncError: true,
        connectedAt: true,
        updatedAt: true,
        // Don't expose tokens to frontend
        accessToken: false,
        refreshToken: false,
        tokenExpiresAt: false,
      },
      orderBy: (integrations, { desc }) => [desc(integrations.connectedAt)],
    });

    return integrations;
  }),

  /**
   * Get integration details by provider
   */
  get: protectedProcedure
    .input(z.object({ provider: z.enum(["quickbooks", "xero"]) }))
    .query(async ({ ctx, input }) => {
      const integration = await ctx.db.query.accountingIntegrations.findFirst({
        where: and(
          eq(accountingIntegrations.tenantId, ctx.tenantId),
          eq(accountingIntegrations.provider, input.provider)
        ),
        columns: {
          id: true,
          provider: true,
          providerAccountName: true,
          providerAccountId: true,
          isActive: true,
          autoSync: true,
          lastSyncedAt: true,
          lastSyncError: true,
          connectedAt: true,
          config: true,
          // Don't expose tokens
          accessToken: false,
          refreshToken: false,
          tokenExpiresAt: false,
        },
      });

      if (!integration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${input.provider} integration not found`,
        });
      }

      return integration;
    }),

  /**
   * Disconnect an integration
   */
  disconnect: adminProcedure
    .input(z.object({ provider: z.enum(["quickbooks", "xero"]) }))
    .mutation(async ({ ctx, input }) => {
      const integration = await ctx.db.query.accountingIntegrations.findFirst({
        where: and(
          eq(accountingIntegrations.tenantId, ctx.tenantId),
          eq(accountingIntegrations.provider, input.provider)
        ),
      });

      if (!integration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${input.provider} integration not found`,
        });
      }

      // Soft delete by marking as inactive
      await ctx.db
        .update(accountingIntegrations)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(accountingIntegrations.id, integration.id));

      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.ORG_SETTINGS_UPDATED,
        entityType: "integration",
        entityId: integration.id,
        description: `Disconnected ${input.provider} integration (${integration.providerAccountName})`,
        metadata: {
          provider: input.provider,
          accountName: integration.providerAccountName,
        },
      });

      return { success: true };
    }),

  /**
   * Toggle auto-sync for an integration
   */
  toggleAutoSync: adminProcedure
    .input(z.object({
      provider: z.enum(["quickbooks", "xero"]),
      autoSync: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const integration = await ctx.db.query.accountingIntegrations.findFirst({
        where: and(
          eq(accountingIntegrations.tenantId, ctx.tenantId),
          eq(accountingIntegrations.provider, input.provider),
          eq(accountingIntegrations.isActive, true)
        ),
      });

      if (!integration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${input.provider} integration not found`,
        });
      }

      await ctx.db
        .update(accountingIntegrations)
        .set({
          autoSync: input.autoSync,
          updatedAt: new Date(),
        })
        .where(eq(accountingIntegrations.id, integration.id));

      return { success: true, autoSync: input.autoSync };
    }),

  /**
   * Get recent sync logs for debugging
   */
  getSyncLogs: adminProcedure
    .input(z.object({
      provider: z.enum(["quickbooks", "xero"]).optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(accountingSyncLogs.tenantId, ctx.tenantId)];

      if (input.provider) {
        conditions.push(eq(accountingSyncLogs.provider, input.provider));
      }

      const logs = await ctx.db.query.accountingSyncLogs.findMany({
        where: and(...conditions),
        orderBy: (logs, { desc }) => [desc(logs.syncedAt)],
        limit: input.limit,
      });

      return logs;
    }),

  /**
   * Get integration connection URL
   * Returns the appropriate OAuth connect URL based on provider
   */
  getConnectUrl: protectedProcedure
    .input(z.object({ provider: z.enum(["quickbooks", "xero"]) }))
    .query(({ input, ctx }) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      return {
        url: `${baseUrl}/api/integrations/${input.provider}/connect`,
        provider: input.provider,
      };
    }),

  /**
   * Manually retry sync for a failed request
   */
  retrySync: adminProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { requests } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");

      // Get request
      const request = await ctx.db.query.requests.findFirst({
        where: eq(requests.id, input.requestId),
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found",
        });
      }

      if (request.tenantId !== ctx.tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Request does not belong to your organization",
        });
      }

      if (request.status !== "approved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only approved requests can be synced",
        });
      }

      // Get active integration with auto-sync
      const integration = await ctx.db.query.accountingIntegrations.findFirst({
        where: and(
          eq(accountingIntegrations.tenantId, ctx.tenantId),
          eq(accountingIntegrations.isActive, true)
        ),
      });

      if (!integration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active accounting integration found",
        });
      }

      // Queue sync job
      const { queueSync } = await import("@/lib/queue/queues/sync");
      await queueSync({
        tenantId: ctx.tenantId,
        provider: integration.provider as "quickbooks" | "xero",
        entity: "purchase_order",
        entityId: input.requestId,
        action: "create",
        data: {},
      });

      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.ORG_SETTINGS_UPDATED,
        entityType: "request",
        entityId: input.requestId,
        description: `Manually triggered sync retry for request ${request.requestNumber}`,
        metadata: {
          provider: integration.provider,
          requestNumber: request.requestNumber,
        },
      });

      return { success: true, provider: integration.provider };
    }),
});
