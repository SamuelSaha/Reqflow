/**
 * Subscriptions router
 * Handles subscription creation, management, and request-to-subscription conversion
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { subscriptions } from "@/lib/db/schema/subscriptions";
import { requests } from "@/lib/db/schema/requests";
import { eq } from "drizzle-orm";

export const subscriptionsRouter = router({
  /**
   * Convert an approved request into a subscription
   * Creates bidirectional linking: request.convertedToSubscriptionId <-> subscription.sourceRequestId
   */
  createFromRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, tenantId } = ctx;

      // 1. Fetch the request
      const [request] = await db
        .select()
        .from(requests)
        .where(eq(requests.id, input.requestId))
        .limit(1);

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found",
        });
      }

      // 2. Validate request belongs to current tenant
      if (request.tenantId !== tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // 3. Validate request is approved
      if (request.status !== "approved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only approved requests can be converted to subscriptions",
        });
      }

      // 4. Validate request hasn't already been converted
      if (request.convertedToSubscriptionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This request has already been converted to a subscription",
        });
      }

      // 5. Validate request is recurring (monthly or annually)
      if (request.frequency === "one-time") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only recurring requests (monthly/annually) can be converted to subscriptions",
        });
      }

      // 6. Validate vendor exists
      if (!request.vendorId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Request must have a vendor to be converted to a subscription",
        });
      }

      // 7. Create the subscription with data pre-filled from request
      const [subscription] = await db
        .insert(subscriptions)
        .values({
          tenantId,
          vendorId: request.vendorId,
          departmentId: request.departmentId,
          sourceRequestId: request.id,

          // Map request fields to subscription fields
          toolName: request.title,
          category: request.category || "other",
          description: request.description || undefined,

          // Financial mapping
          totalCost: request.amount,
          currency: request.currency,
          billingCycle: request.frequency === "monthly" ? "monthly" : "annually",
          seats: request.quantity || undefined,

          // Ownership
          requestedById: request.requesterId,

          // Status and dates
          status: "active",
          startDate: new Date().toISOString().split("T")[0], // Today as start date
        })
        .returning();

      // 8. Update the request to link to the new subscription
      await db
        .update(requests)
        .set({
          convertedToSubscriptionId: subscription.id,
          updatedAt: new Date(),
        })
        .where(eq(requests.id, request.id));

      return subscription;
    }),

  /**
   * Get subscription by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, tenantId } = ctx;

      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, input.id))
        .limit(1);

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      if (subscription.tenantId !== tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return subscription;
    }),
});
