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
