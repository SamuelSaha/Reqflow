/**
 * tRPC router for purchase requests
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { requests, approvals, insertRequestSchema } from "../../db/schema";
import { eq, and, desc, asc, count, sql, or, ilike, gte, lte } from "drizzle-orm";
import { createAuditLog, AuditAction } from "../../monitoring/audit";

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
   * List current user's own requests with search and filters
   */
  myList: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        search: z.string().optional(),
        status: z.enum(["draft", "pending", "approved", "rejected", "cancelled"]).optional(),
        category: z.string().optional(),
        urgency: z.enum(["low", "normal", "urgent"]).optional(),
        minAmount: z.string().optional(),
        maxAmount: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        sortBy: z.enum(["createdAt", "amount", "status", "title"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Build WHERE conditions
      const conditions = [
        eq(requests.tenantId, ctx.tenantId),
        eq(requests.requesterId, ctx.user.id),
      ];

      // Status filter
      if (input?.status) {
        conditions.push(eq(requests.status, input.status));
      }

      // Category filter
      if (input?.category) {
        conditions.push(eq(requests.category, input.category));
      }

      // Urgency filter
      if (input?.urgency) {
        conditions.push(eq(requests.urgency, input.urgency));
      }

      // Amount range filter
      if (input?.minAmount) {
        conditions.push(gte(requests.amount, input.minAmount));
      }
      if (input?.maxAmount) {
        conditions.push(lte(requests.amount, input.maxAmount));
      }

      // Date range filter
      if (input?.dateFrom) {
        conditions.push(gte(requests.createdAt, new Date(input.dateFrom)));
      }
      if (input?.dateTo) {
        conditions.push(lte(requests.createdAt, new Date(input.dateTo)));
      }

      // Search filter (request number, title, vendor name)
      if (input?.search) {
        conditions.push(
          or(
            ilike(requests.requestNumber, `%${input.search}%`),
            ilike(requests.title, `%${input.search}%`),
            ilike(requests.vendorName, `%${input.search}%`)
          )!
        );
      }

      // Determine sort order
      const sortField = input?.sortBy ?? "createdAt";
      const sortDirection = input?.sortOrder ?? "desc";

      // Map sort fields to actual columns
      let orderBy;
      if (sortField === "createdAt") {
        orderBy = sortDirection === "asc" ? [asc(requests.createdAt)] : [desc(requests.createdAt)];
      } else if (sortField === "amount") {
        orderBy = sortDirection === "asc" ? [asc(requests.amount)] : [desc(requests.amount)];
      } else if (sortField === "status") {
        orderBy = sortDirection === "asc" ? [asc(requests.status)] : [desc(requests.status)];
      } else if (sortField === "title") {
        orderBy = sortDirection === "asc" ? [asc(requests.title)] : [desc(requests.title)];
      } else {
        orderBy = [desc(requests.createdAt)];
      }

      const items = await ctx.db.query.requests.findMany({
        where: and(...conditions),
        limit: input?.limit ?? 50,
        orderBy,
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
          category: true,
          convertedToSubscription: true,
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

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.REQUEST_CREATED,
        entityType: "request",
        entityId: newRequest.id,
        description: `Created request: ${input.title}`,
        metadata: {
          requestNumber: newRequest.requestNumber,
          amount: input.amount,
          category: input.category,
        },
      });

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

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.REQUEST_UPDATED,
        entityType: "request",
        entityId: input.id,
        description: `Updated request: ${existing.title}`,
        metadata: {
          requestNumber: existing.requestNumber,
          changes: Object.keys(input.data),
        },
        before: {
          title: existing.title,
          amount: existing.amount,
          category: existing.category,
        },
        after: {
          title: updated.title,
          amount: updated.amount,
          category: updated.category,
        },
      });

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

      // Send email notifications — fire-and-forget (don't block submission on Redis/email)
      void (async () => {
        try {
          const { emailQueue, EmailTemplate } = await import("../../queue/queues/email");
          const { env } = await import("../../env");

          const fullRequest = await ctx.db.query.requests.findFirst({
            where: eq(requests.id, input.id),
            with: { requester: true },
          });

          if (fullRequest) {
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

            if (!routingResult.flags.autoApproved) {
              const firstStepApprovals = await ctx.db.query.approvals.findMany({
                where: and(
                  eq(approvals.requestId, input.id),
                  eq(approvals.step, 0)
                ),
                with: { approver: true },
              });

              for (const approval of firstStepApprovals) {
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
                    riskFlags: [] as string[],
                    approvalUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/approvals`,
                  },
                });
              }
            }
          }
        } catch {
          // Silently ignore — Redis likely not running in dev
        }
      })();

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.REQUEST_SUBMITTED,
        entityType: "request",
        entityId: input.id,
        description: `Submitted request: ${request.title}`,
        metadata: {
          requestNumber: request.requestNumber,
          workflowName: routingResult.workflowName,
          autoApproved: routingResult.flags.autoApproved,
          approvalSteps: routingResult.steps.length,
        },
      });

      return {
        success: true,
        workflowName: routingResult.workflowName,
        approvalSteps: routingResult.steps.length,
        flags: routingResult.flags,
      };
    }),

  /**
   * Delete a draft request
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // First check if request exists and is a draft
      const request = await ctx.db.query.requests.findFirst({
        where: and(
          eq(requests.id, input.id),
          eq(requests.tenantId, ctx.tenantId),
          eq(requests.requesterId, ctx.user.id)
        ),
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found",
        });
      }

      if (request.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft requests can be deleted",
        });
      }

      // Delete the request
      await ctx.db
        .delete(requests)
        .where(
          and(
            eq(requests.id, input.id),
            eq(requests.tenantId, ctx.tenantId)
          )
        );

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.REQUEST_DELETED,
        entityType: "request",
        entityId: input.id,
        description: `Deleted draft request: ${request.title}`,
        metadata: {
          requestNumber: request.requestNumber,
        },
      });

      return { success: true };
    }),
});
