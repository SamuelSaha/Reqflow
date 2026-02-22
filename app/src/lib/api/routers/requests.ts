/**
 * tRPC router for purchase requests
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { requests, insertRequestSchema } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";

export const requestsRouter = router({
  /**
   * List all requests for current user's organization
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(["draft", "pending", "approved", "rejected", "cancelled"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.requests.findMany({
        where: and(
          eq(requests.tenantId, ctx.tenantId),
          input.status ? eq(requests.status, input.status) : undefined
        ),
        limit: input.limit,
        offset: input.offset,
        orderBy: [desc(requests.createdAt)],
        with: {
          requester: true,
          department: true,
        },
      });

      return items;
    }),

  /**
   * Get single request by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.db.query.requests.findFirst({
        where: and(
          eq(requests.id, input.id),
          eq(requests.tenantId, ctx.tenantId)
        ),
        with: {
          requester: true,
          department: true,
          budget: true,
        },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found",
        });
      }

      return request;
    }),

  /**
   * Create new request
   */
  create: protectedProcedure
    .input(
      insertRequestSchema.pick({
        title: true,
        description: true,
        category: true,
        vendorName: true,
        amount: true,
        frequency: true,
        quantity: true,
        urgency: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate request number
      const count = await ctx.db.$count(
        requests,
        eq(requests.tenantId, ctx.tenantId)
      );
      const requestNumber = `REQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      // Create request
      const [newRequest] = await ctx.db
        .insert(requests)
        .values({
          ...input,
          requestNumber,
          tenantId: ctx.tenantId,
          requesterId: ctx.user.id,
          departmentId: ctx.user.departmentId!,
          status: "draft",
        })
        .returning();

      // TODO: Trigger AI classification
      // TODO: Check for duplicates

      return newRequest;
    }),

  /**
   * Update request
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: insertRequestSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.requests.findFirst({
        where: and(
          eq(requests.id, input.id),
          eq(requests.tenantId, ctx.tenantId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Only requester can edit draft requests
      if (
        existing.status !== "draft" ||
        existing.requesterId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Can only edit your own draft requests",
        });
      }

      const [updated] = await ctx.db
        .update(requests)
        .set(input.data)
        .where(eq(requests.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Submit request for approval
   */
  submit: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.query.requests.findFirst({
        where: and(
          eq(requests.id, input.id),
          eq(requests.tenantId, ctx.tenantId),
          eq(requests.requesterId, ctx.user.id)
        ),
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (request.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only submit draft requests",
        });
      }

      // Update status
      await ctx.db
        .update(requests)
        .set({
          status: "pending",
          submittedAt: new Date(),
        })
        .where(eq(requests.id, input.id));

      // TODO: Trigger approval workflow routing
      // TODO: Send notifications to approvers

      return { success: true };
    }),
});
