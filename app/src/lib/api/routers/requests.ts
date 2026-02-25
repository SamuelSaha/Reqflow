/**
 * tRPC router for purchase requests
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { requests, approvals, insertRequestSchema } from "../../db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";

export const requestsRouter = router({
  /**
   * Dashboard stats for current user
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [myRequests] = await ctx.db
      .select({ count: count() })
      .from(requests)
      .where(
        and(
          eq(requests.tenantId, ctx.tenantId),
          eq(requests.requesterId, ctx.user.id)
        )
      );

    const [myPending] = await ctx.db
      .select({ count: count() })
      .from(requests)
      .where(
        and(
          eq(requests.tenantId, ctx.tenantId),
          eq(requests.requesterId, ctx.user.id),
          eq(requests.status, "pending")
        )
      );

    const [pendingApprovals] = await ctx.db
      .select({ count: count() })
      .from(approvals)
      .where(
        and(
          eq(approvals.tenantId, ctx.tenantId),
          eq(approvals.approverId, ctx.user.id),
          eq(approvals.decision, "pending")
        )
      );

    const [approvedThisMonth] = await ctx.db
      .select({
        total: sql<string>`coalesce(sum(${requests.amount}), '0')`,
      })
      .from(requests)
      .where(
        and(
          eq(requests.tenantId, ctx.tenantId),
          eq(requests.status, "approved"),
          sql`${requests.approvedAt} >= date_trunc('month', now())`
        )
      );

    return {
      myRequests: myRequests.count,
      myPending: myPending.count,
      pendingApprovals: pendingApprovals.count,
      approvedThisMonth: parseFloat(approvedThisMonth.total),
    };
  }),

  /**
   * List current user's own requests
   */
  myList: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        status: z.enum(["draft", "pending", "approved", "rejected", "cancelled"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.requests.findMany({
        where: and(
          eq(requests.tenantId, ctx.tenantId),
          eq(requests.requesterId, ctx.user.id),
          input?.status ? eq(requests.status, input.status) : undefined
        ),
        limit: input?.limit ?? 50,
        orderBy: [desc(requests.createdAt)],
        with: {
          department: true,
        },
      });

      return items;
    }),

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
   * Get single request by ID with approval chain
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

      // Fetch approval chain
      const approvalChain = await ctx.db.query.approvals.findMany({
        where: and(
          eq(approvals.requestId, input.id),
          eq(approvals.tenantId, ctx.tenantId)
        ),
        orderBy: [approvals.step],
        with: {
          approver: true,
        },
      });

      return { ...request, approvals: approvalChain };
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

      // Route through approval workflow
      const { buildRoutingContext, routeApproval, executeApprovalRouting } =
        await import("../../workflows/approval-router");

      const routingContext = await buildRoutingContext(ctx.tenantId, input.id);
      const routingResult = await routeApproval(routingContext);

      // Update status
      await ctx.db
        .update(requests)
        .set({
          status: routingResult.flags.autoApproved ? "approved" : "pending",
          submittedAt: new Date(),
          ...(routingResult.flags.autoApproved ? { approvedAt: new Date() } : {}),
        })
        .where(eq(requests.id, input.id));

      // Persist approval chain
      await executeApprovalRouting(ctx.tenantId, input.id, routingResult);

      // Send email notifications
      const { emailQueue, EmailTemplate } = await import("../../queue/queues/email");
      const { env } = await import("../../env");

      // Get full request details with requester info
      const fullRequest = await ctx.db.query.requests.findFirst({
        where: eq(requests.id, input.id),
        with: { requester: true },
      });

      if (!fullRequest) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // 1. Send confirmation email to requester
      await emailQueue.add("request-submitted", {
        to: fullRequest.requester.email,
        subject: `Request Submitted: ${fullRequest.requestNumber}`,
        template: EmailTemplate.REQUEST_SUBMITTED,
        data: {
          requesterName: fullRequest.requester.name,
          requestNumber: fullRequest.requestNumber,
          title: fullRequest.title,
          amount: parseFloat(fullRequest.amount).toLocaleString("en", { minimumFractionDigits: 2 }),
          currency: fullRequest.currency,
          requestUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/requests/${fullRequest.id}`,
        },
      });

      // 2. Send notification emails to approvers (unless auto-approved)
      if (!routingResult.flags.autoApproved) {
        // Get first step approvers
        const firstStepApprovals = await ctx.db.query.approvals.findMany({
          where: and(
            eq(approvals.requestId, input.id),
            eq(approvals.step, 0) // First step
          ),
          with: { approver: true },
        });

        for (const approval of firstStepApprovals) {
          // TODO: Add risk flags from AI analysis when implemented
          const riskFlags: string[] = [];

          await emailQueue.add(`approval-assigned-${approval.id}`, {
            to: approval.approver.email,
            subject: `Action Required: Approve ${fullRequest.requestNumber} - ${fullRequest.title}`,
            template: EmailTemplate.APPROVAL_REQUESTED,
            data: {
              approverName: approval.approver.name,
              requesterName: fullRequest.requester.name,
              requestNumber: fullRequest.requestNumber,
              title: fullRequest.title,
              amount: parseFloat(fullRequest.amount).toLocaleString("en", { minimumFractionDigits: 2 }),
              currency: fullRequest.currency,
              vendor: fullRequest.vendorName,
              category: fullRequest.category,
              urgency: fullRequest.urgency,
              riskFlags,
              approvalUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/approvals`,
            },
          });
        }
      }

      return {
        success: true,
        workflowName: routingResult.workflowName,
        approvalSteps: routingResult.steps.length,
        flags: routingResult.flags,
      };
    }),
});
