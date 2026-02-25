/**
 * tRPC router for approvals
 * Handles listing, deciding, and AI analysis of pending approvals
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { approvals, requests } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { analyzeRequest } from "../../ai/request-analyzer";

export const approvalsRouter = router({
  /**
   * List approvals assigned to the current user
   */
  myQueue: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).default("pending"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const status = input?.status ?? "pending";

      const items = await ctx.db.query.approvals.findMany({
        where: and(
          eq(approvals.tenantId, ctx.tenantId),
          eq(approvals.approverId, ctx.user.id),
          eq(approvals.decision, status)
        ),
        orderBy: [desc(approvals.createdAt)],
        with: {
          request: {
            with: {
              requester: true,
              department: true,
              budget: true,
            },
          },
        },
      });

      return items;
    }),

  /**
   * Get AI analysis for a specific request
   * This triggers the agentic analyzer
   */
  analyze: protectedProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify the user has an approval for this request
      const approval = await ctx.db.query.approvals.findFirst({
        where: and(
          eq(approvals.requestId, input.requestId),
          eq(approvals.approverId, ctx.user.id),
          eq(approvals.tenantId, ctx.tenantId)
        ),
      });

      if (!approval) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have an approval for this request",
        });
      }

      // Run the agentic analysis
      const analysis = await analyzeRequest(ctx.tenantId, input.requestId);
      return analysis;
    }),

  /**
   * Make a decision on an approval (approve or reject)
   */
  decide: protectedProcedure
    .input(
      z.object({
        approvalId: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find the approval
      const approval = await ctx.db.query.approvals.findFirst({
        where: and(
          eq(approvals.id, input.approvalId),
          eq(approvals.approverId, ctx.user.id),
          eq(approvals.tenantId, ctx.tenantId)
        ),
      });

      if (!approval) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (approval.decision !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This approval has already been decided",
        });
      }

      // Update the approval
      await ctx.db
        .update(approvals)
        .set({
          decision: input.decision,
          comments: input.comments ?? null,
          decidedAt: new Date(),
        })
        .where(eq(approvals.id, input.approvalId));

      // Check if all required approvals for this request are done
      const allApprovals = await ctx.db.query.approvals.findMany({
        where: and(
          eq(approvals.requestId, approval.requestId),
          eq(approvals.tenantId, ctx.tenantId)
        ),
      });

      const requiredApprovals = allApprovals.filter((a) => a.required === "required");
      const allRequiredDecided = requiredApprovals.every((a) =>
        a.id === input.approvalId ? true : a.decision !== "pending"
      );

      if (allRequiredDecided) {
        // If any required approval was rejected, reject the request
        const anyRejected =
          input.decision === "rejected" ||
          requiredApprovals.some((a) => a.id !== input.approvalId && a.decision === "rejected");

        await ctx.db
          .update(requests)
          .set({
            status: anyRejected ? "rejected" : "approved",
            ...(anyRejected
              ? { rejectedAt: new Date() }
              : { approvedAt: new Date() }),
            updatedAt: new Date(),
          })
          .where(eq(requests.id, approval.requestId));

        // Send email notification to requester
        const { emailQueue, EmailTemplate } = await import("../../queue/queues/email");
        const { env } = await import("../../env");

        // Get full request with requester and approver details
        const fullRequest = await ctx.db.query.requests.findFirst({
          where: eq(requests.id, approval.requestId),
          with: { requester: true },
        });

        if (fullRequest) {
          if (anyRejected) {
            // Send rejection email
            await emailQueue.add(`request-rejected-${approval.requestId}`, {
              to: fullRequest.requester.email,
              subject: `Request Not Approved: ${fullRequest.requestNumber}`,
              template: EmailTemplate.REQUEST_REJECTED,
              data: {
                requesterName: fullRequest.requester.name,
                requestNumber: fullRequest.requestNumber,
                title: fullRequest.title,
                amount: parseFloat(fullRequest.amount).toLocaleString("en", { minimumFractionDigits: 2 }),
                currency: fullRequest.currency,
                rejectorName: ctx.user.name,
                rejectionReason: input.comments || "No reason provided",
                canResubmit: true,
                requestUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/requests/${fullRequest.id}`,
              },
            });
          } else {
            // Send approval email
            // Check if there are more approval steps
            const nextStepApprovals = allApprovals.filter(
              (a) => a.step > approval.step && a.decision === "pending"
            );
            const hasMoreApprovers = nextStepApprovals.length > 0;
            const nextApproverName = hasMoreApprovers
              ? await ctx.db.query.users.findFirst({
                  where: eq((await import("../../db/schema")).users.id, nextStepApprovals[0].approverId),
                }).then((u) => u?.name)
              : undefined;

            await emailQueue.add(`request-approved-${approval.requestId}`, {
              to: fullRequest.requester.email,
              subject: `Request Approved: ${fullRequest.requestNumber}`,
              template: EmailTemplate.REQUEST_APPROVED,
              data: {
                requesterName: fullRequest.requester.name,
                requestNumber: fullRequest.requestNumber,
                title: fullRequest.title,
                amount: parseFloat(fullRequest.amount).toLocaleString("en", { minimumFractionDigits: 2 }),
                currency: fullRequest.currency,
                approverName: ctx.user.name,
                approverComments: input.comments,
                hasMoreApprovers,
                nextApproverName,
                requestUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/requests/${fullRequest.id}`,
              },
            });
          }
        }
      }

      return {
        success: true,
        requestCompleted: allRequiredDecided,
        requestStatus: allRequiredDecided
          ? input.decision === "rejected" ||
            requiredApprovals.some((a) => a.id !== input.approvalId && a.decision === "rejected")
            ? "rejected"
            : "approved"
          : "pending",
      };
    }),
});
