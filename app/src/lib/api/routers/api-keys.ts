/**
 * tRPC router for API key management
 * API keys allow CLI / programmatic access without cookie sessions.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { apiKeys } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { createAuditLog, AuditAction } from "../../monitoring/audit";

/**
 * Generate a cryptographically secure API key.
 * Format: rqf_<64 hex chars>  (256 bits of entropy)
 * Returns { raw, hash, prefix }
 */
async function generateApiKey() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const raw = "rqf_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Keep the first 8 chars after "rqf_" as the visible prefix
  const prefix = raw.slice(0, 12); // "rqf_" + 8 chars

  return { raw, hash, prefix };
}

export const apiKeysRouter = router({
  /**
   * List all API keys for the current user (never returns the raw key)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.apiKeys.findMany({
      where: and(
        eq(apiKeys.tenantId, ctx.tenantId),
        eq(apiKeys.userId, ctx.user.id)
      ),
      columns: {
        id: true,
        name: true,
        keyPrefix: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
        // keyHash is intentionally excluded
      },
    });
  }),

  /**
   * Create a new API key.
   * The raw key is returned ONCE — it cannot be retrieved again.
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        expiresAt: z.string().datetime().optional(), // ISO string or omit for no expiry
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { raw, hash, prefix } = await generateApiKey();

      const [key] = await ctx.db
        .insert(apiKeys)
        .values({
          tenantId: ctx.tenantId,
          userId: ctx.user.id,
          name: input.name,
          keyPrefix: prefix,
          keyHash: hash,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        })
        .returning({
          id: apiKeys.id,
          name: apiKeys.name,
          keyPrefix: apiKeys.keyPrefix,
          expiresAt: apiKeys.expiresAt,
          createdAt: apiKeys.createdAt,
        });

      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.ORG_SETTINGS_UPDATED,
        entityType: "api_key",
        entityId: key.id,
        description: `Created API key: ${input.name}`,
      });

      return { ...key, key: raw }; // raw key returned once only
    }),

  /**
   * Revoke (delete) an API key by ID
   */
  revoke: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.apiKeys.findFirst({
        where: and(
          eq(apiKeys.id, input.id),
          eq(apiKeys.userId, ctx.user.id),
          eq(apiKeys.tenantId, ctx.tenantId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .delete(apiKeys)
        .where(eq(apiKeys.id, input.id));

      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.ORG_SETTINGS_UPDATED,
        entityType: "api_key",
        entityId: input.id,
        description: `Revoked API key: ${existing.name}`,
      });

      return { success: true };
    }),
});
