/**
 * tRPC router for approvals
 * Handles listing, deciding, and AI analysis of pending approvals
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { approvals, requests } from "../../db/schema";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";
import { analyzeRequest } from "../../ai/request-analyzer";
import { createAuditLog, AuditAction } from "../../monitoring/audit";
import { createNotification } from "./notifications";

export const approvalsRouter = router({
  /**
   * List approvals assigned to the current user with search and filters
   */
  myQueue: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).default("pending"),
        search: z.string().optional(),
        category: z.string().optional(),
        urgency: z.enum(["low", "normal", "urgent"]).optional(),
        minAmount: z.string().optional(),
        maxAmount: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        sortBy: z.enum(["createdAt", "amount", "title"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const status = input?.status ?? "pending";

      // Build WHERE conditions for approvals
      const approvalConditions = [
        eq(approvals.tenantId, ctx.tenantId),
        eq(approvals.approverId, ctx.user.id),
        eq(approvals.decision, status),
      ];

      // Date range filter on approvals
      if (input?.dateFrom) {
        approvalConditions.push(gte(approvals.createdAt, new Date(input.dateFrom)));
      }
      if (input?.dateTo) {
        approvalConditions.push(lte(approvals.createdAt, new Date(input.dateTo)));
      }

      // Determine sort order (only use createdAt for approvals, sort by other fields in-memory)
      const sortDirection = input?.sortOrder ?? "desc";
      const orderBy = sortDirection === "asc"
        ? [asc(approvals.createdAt)]
        : [desc(approvals.createdAt)];

      let items = await ctx.db.query.approvals.findMany({
        where: and(...approvalConditions),
        orderBy,
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

      // Apply request-level filters (search, category, urgency, amount)
      // Note: These are applied in-memory since we can't easily join in Drizzle query builder
      if (input?.search) {
        const searchLower = input.search.toLowerCase();
        items = items.filter(
          (item) =>
            item.request.requestNumber.toLowerCase().includes(searchLower) ||
            item.request.title.toLowerCase().includes(searchLower) ||
            (item.request.vendorName?.toLowerCase().includes(searchLower) ?? false)
        );
      }

      if (input?.category) {
        items = items.filter((item) => item.request.category === input.category);
      }

      if (input?.urgency) {
        items = items.filter((item) => item.request.urgency === input.urgency);
      }

      if (input?.minAmount) {
        items = items.filter((item) => parseFloat(item.request.amount) >= parseFloat(input.minAmount!));
      }

      if (input?.maxAmount) {
        items = items.filter((item) => parseFloat(item.request.amount) <= parseFloat(input.maxAmount!));
      }

      // Apply in-memory sorting for request fields (title, amount)
      const sortField = input?.sortBy ?? "createdAt";
      if (sortField === "title") {
        items.sort((a, b) => {
          const comparison = a.request.title.localeCompare(b.request.title);
          return sortDirection === "asc" ? comparison : -comparison;
        });
      } else if (sortField === "amount") {
        items.sort((a, b) => {
          const comparison = parseFloat(a.request.amount) - parseFloat(b.request.amount);
          return sortDirection === "asc" ? comparison : -comparison;
        });
      }

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

      // Track sync status for toast notification
      let syncQueued = false;
      let syncProvider: string | null = null;

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

        // Queue accounting sync if approved
        if (!anyRejected) {
          const { accountingIntegrations } = await import("../../db/schema");
          const activeIntegration = await ctx.db.query.accountingIntegrations.findFirst({
            where: and(
              eq(accountingIntegrations.tenantId, ctx.tenantId),
              eq(accountingIntegrations.isActive, true),
              eq(accountingIntegrations.autoSync, true)
            ),
          });

          if (activeIntegration) {
            const { queueSync } = await import("../../queue/queues/sync");
            await queueSync({
              tenantId: ctx.tenantId,
              provider: activeIntegration.provider as "quickbooks" | "xero",
              entity: "purchase_order",
              entityId: approval.requestId,
              action: "create",
              data: {},
            });
            syncQueued = true;
            syncProvider = activeIntegration.provider;
          }
        }

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

            // Create in-app notification for requester
            await createNotification(ctx.db, {
              tenantId: ctx.tenantId,
              userId: fullRequest.requesterId,
              type: "request_rejected",
              title: "Request Not Approved",
              message: `Your request "${fullRequest.title}" (${fullRequest.requestNumber}) was not approved by ${ctx.user.name}.`,
              actionUrl: `/dashboard/requests/${fullRequest.id}`,
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

            // Create in-app notification for requester
            const approvalMessage = hasMoreApprovers
              ? `Your request "${fullRequest.title}" (${fullRequest.requestNumber}) was approved by ${ctx.user.name}. Awaiting approval from ${nextApproverName}.`
              : `Your request "${fullRequest.title}" (${fullRequest.requestNumber}) has been fully approved!`;

            await createNotification(ctx.db, {
              tenantId: ctx.tenantId,
              userId: fullRequest.requesterId,
              type: "request_approved",
              title: hasMoreApprovers ? "Request Partially Approved" : "Request Approved",
              message: approvalMessage,
              actionUrl: `/dashboard/requests/${fullRequest.id}`,
            });
          }
        }
      }

      // Audit log
      const requestForAudit = await ctx.db.query.requests.findFirst({
        where: eq(requests.id, approval.requestId),
      });

      if (requestForAudit) {
        await createAuditLog({
          tenantId: ctx.tenantId,
          userId: ctx.user.id,
          userEmail: ctx.user.email,
          userName: ctx.user.name,
          action: AuditAction.APPROVAL_DECIDED,
          entityType: "approval",
          entityId: input.approvalId,
          description: `${input.decision === "approved" ? "Approved" : "Rejected"} request: ${requestForAudit.title}`,
          metadata: {
            requestId: approval.requestId,
            requestNumber: requestForAudit.requestNumber,
            decision: input.decision,
            comments: input.comments,
            step: approval.step,
            allRequiredDecided,
          },
        });
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
        syncQueued,
        syncProvider,
      };
    }),

  /**
   * Bulk approve multiple approvals at once
   * Returns partial success (some may succeed, some may fail)
   */
  bulkApprove: protectedProcedure
    .input(
      z.object({
        approvalIds: z.array(z.string().uuid()).min(1).max(50),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const succeeded: string[] = [];
      const failed: Array<{ id: string; error: string }> = [];

      // Process each approval individually
      for (const approvalId of input.approvalIds) {
        try {
          // Verify approval exists and belongs to this user
          const approval = await ctx.db.query.approvals.findFirst({
            where: and(
              eq(approvals.id, approvalId),
              eq(approvals.approverId, ctx.user.id),
              eq(approvals.tenantId, ctx.tenantId)
            ),
          });

          if (!approval) {
            failed.push({ id: approvalId, error: "Not found or unauthorized" });
            continue;
          }

          if (approval.decision !== "pending") {
            failed.push({ id: approvalId, error: "Already decided" });
            continue;
          }

          // Update the approval
          await ctx.db
            .update(approvals)
            .set({
              decision: "approved",
              comments: input.comments ?? null,
              decidedAt: new Date(),
            })
            .where(eq(approvals.id, approvalId));

          succeeded.push(approvalId);

          // Check if request is fully approved (simplified - full logic in single approve)
          const allApprovals = await ctx.db.query.approvals.findMany({
            where: and(
              eq(approvals.requestId, approval.requestId),
              eq(approvals.tenantId, ctx.tenantId)
            ),
          });

          const requiredApprovals = allApprovals.filter((a) => a.required === "required");
          const allRequiredDecided = requiredApprovals.every((a) =>
            a.id === approvalId ? true : a.decision !== "pending"
          );

          if (allRequiredDecided) {
            const anyRejected = requiredApprovals.some(
              (a) => a.id !== approvalId && a.decision === "rejected"
            );

            if (!anyRejected) {
              await ctx.db
                .update(requests)
                .set({
                  status: "approved",
                  approvedAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(requests.id, approval.requestId));
            }
          }
        } catch (err) {
          failed.push({
            id: approvalId,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      return { succeeded, failed };
    }),

  /**
   * Bulk reject multiple approvals with a single reason
   */
  bulkReject: protectedProcedure
    .input(
      z.object({
        approvalIds: z.array(z.string().uuid()).min(1).max(50),
        reason: z.string().min(10, "Reason must be at least 10 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const succeeded: string[] = [];
      const failed: Array<{ id: string; error: string }> = [];

      for (const approvalId of input.approvalIds) {
        try {
          const approval = await ctx.db.query.approvals.findFirst({
            where: and(
              eq(approvals.id, approvalId),
              eq(approvals.approverId, ctx.user.id),
              eq(approvals.tenantId, ctx.tenantId)
            ),
          });

          if (!approval) {
            failed.push({ id: approvalId, error: "Not found or unauthorized" });
            continue;
          }

          if (approval.decision !== "pending") {
            failed.push({ id: approvalId, error: "Already decided" });
            continue;
          }

          // Update the approval
          await ctx.db
            .update(approvals)
            .set({
              decision: "rejected",
              comments: input.reason,
              decidedAt: new Date(),
            })
            .where(eq(approvals.id, approvalId));

          succeeded.push(approvalId);

          // Update request status to rejected
          const allApprovals = await ctx.db.query.approvals.findMany({
            where: and(
              eq(approvals.requestId, approval.requestId),
              eq(approvals.tenantId, ctx.tenantId)
            ),
          });

          const requiredApprovals = allApprovals.filter((a) => a.required === "required");
          const allRequiredDecided = requiredApprovals.every((a) =>
            a.id === approvalId ? true : a.decision !== "pending"
          );

          if (allRequiredDecided) {
            await ctx.db
              .update(requests)
              .set({
                status: "rejected",
                rejectedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(requests.id, approval.requestId));
          }
        } catch (err) {
          failed.push({
            id: approvalId,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      return { succeeded, failed };
    }),
});
