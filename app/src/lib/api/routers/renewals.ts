/**
 * Renewals tRPC Router
 * Handles renewal event management: list, update checkpoints, make decisions
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, gte, lte, or, type SQL } from "drizzle-orm";
import { differenceInDays, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { renewalEvents } from "@/lib/db/schema";
import {
  initializeCheckpoints,
  calculateReadinessScore,
  getUrgencyColor,
  type RenewalCheckpoint,
} from "@/lib/utils/renewal-readiness";

export const renewalsRouter = router({
  /**
   * List all renewals for tenant (with filters)
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["upcoming", "in_review", "decided", "auto_renewed", "missed"])
          .optional(),
        urgency: z.enum(["green", "yellow", "red"]).optional(),
        dateRange: z
          .object({
            from: z.string(), // ISO date
            to: z.string(), // ISO date
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const today = new Date();

      // Build where clause
      const conditions: SQL[] = [eq(renewalEvents.tenantId, tenantId)];

      if (input.status) {
        conditions.push(eq(renewalEvents.status, input.status));
      }

      if (input.dateRange) {
        conditions.push(
          gte(renewalEvents.noticeDeadline, input.dateRange.from),
          lte(renewalEvents.noticeDeadline, input.dateRange.to)
        );
      }

      const where = conditions.length > 1 ? and(...conditions) : conditions[0];

      const renewalsList = await db.query.renewalEvents.findMany({
        where,
        with: {
          contract: {
            with: {
              vendor: true,
            },
          },
          subscription: true,
        },
        orderBy: [renewalEvents.noticeDeadline],
      });

      // Calculate urgency and filter
      return renewalsList
        .map((renewal) => {
          const deadline = parseISO(renewal.noticeDeadline);
          const daysUntilDeadline = differenceInDays(deadline, today);

          // Get readiness score
          const readiness = renewal.readinessScore;
          const totalScore = readiness?.totalScore ?? 0;

          const urgencyColor = getUrgencyColor(daysUntilDeadline, totalScore);

          return {
            ...renewal,
            daysUntilDeadline,
            readinessScore: totalScore,
            urgencyColor,
          };
        })
        .filter((renewal) => {
          // Filter by urgency if specified
          if (input.urgency && renewal.urgencyColor !== input.urgency) {
            return false;
          }
          return true;
        });
    }),

  /**
   * Get single renewal by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const today = new Date();

      const renewal = await db.query.renewalEvents.findFirst({
        where: and(
          eq(renewalEvents.id, input.id),
          eq(renewalEvents.tenantId, tenantId)
        ),
        with: {
          contract: {
            with: {
              vendor: true,
            },
          },
          subscription: true,
        },
      });

      if (!renewal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Renewal not found",
        });
      }

      // Calculate days until deadline
      const deadline = parseISO(renewal.noticeDeadline);
      const daysUntilDeadline = differenceInDays(deadline, today);

      // Get readiness
      const readiness = renewal.readinessScore;
      const checkpoints = readiness?.checkpoints ?? initializeCheckpoints();
      const totalScore = calculateReadinessScore(checkpoints);

      const urgencyColor = getUrgencyColor(daysUntilDeadline, totalScore);

      return {
        ...renewal,
        daysUntilDeadline,
        readinessCheckpoints: checkpoints,
        readinessScore: totalScore,
        urgencyColor,
      };
    }),

  /**
   * Update a checkpoint (mark complete/incomplete with notes)
   */
  updateCheckpoint: protectedProcedure
    .input(
      z.object({
        renewalId: z.string().uuid(),
        checkpointId: z.string(),
        completed: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const userId = ctx.user.id;

      // Fetch renewal
      const renewal = await db.query.renewalEvents.findFirst({
        where: and(
          eq(renewalEvents.id, input.renewalId),
          eq(renewalEvents.tenantId, tenantId)
        ),
      });

      if (!renewal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Renewal not found",
        });
      }

      // Get existing checkpoints or initialize
      const readiness = renewal.readinessScore;
      let checkpoints: RenewalCheckpoint[] =
        readiness?.checkpoints ?? initializeCheckpoints();

      // Update the specific checkpoint
      checkpoints = checkpoints.map((checkpoint) => {
        if (checkpoint.id === input.checkpointId) {
          return {
            ...checkpoint,
            completed: input.completed,
            completedAt: input.completed ? new Date().toISOString() : undefined,
            completedById: input.completed ? userId : undefined,
            notes: input.notes ?? checkpoint.notes,
          };
        }
        return checkpoint;
      });

      // Recalculate score
      const totalScore = calculateReadinessScore(checkpoints);

      // Update renewal
      const [updatedRenewal] = await db
        .update(renewalEvents)
        .set({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          readinessScore: { checkpoints, totalScore } as any,
          status: totalScore === 100 ? "in_review" : renewal.status,
          updatedAt: new Date(),
        })
        .where(eq(renewalEvents.id, input.renewalId))
        .returning();

      return {
        renewal: updatedRenewal,
        checkpoints,
        totalScore,
      };
    }),

  /**
   * Make decision on renewal (keep/downgrade/cancel/replace/renegotiate)
   */
  makeDecision: protectedProcedure
    .input(
      z.object({
        renewalId: z.string().uuid(),
        decision: z.enum(["keep", "downgrade", "cancel", "replace", "renegotiate"]),
        decisionNotes: z.string().min(10),
        ownerId: z.string().uuid().optional(),
        savingsAmount: z.string().optional(), // For renegotiate
        newContractId: z.string().uuid().optional(), // For replace
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const userId = ctx.user.id;

      // Fetch renewal
      const renewal = await db.query.renewalEvents.findFirst({
        where: and(
          eq(renewalEvents.id, input.renewalId),
          eq(renewalEvents.tenantId, tenantId)
        ),
      });

      if (!renewal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Renewal not found",
        });
      }

      if (renewal.status === "decided") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Decision already made for this renewal",
        });
      }

      // Update renewal with decision
      const [updatedRenewal] = await db
        .update(renewalEvents)
        .set({
          status: "decided",
          decision: input.decision,
          decisionDate: new Date(),
          decisionById: userId,
          decisionNotes: input.decisionNotes,
          savingsAmount: input.savingsAmount,
          newContractId: input.newContractId,
          updatedAt: new Date(),
        })
        .where(eq(renewalEvents.id, input.renewalId))
        .returning();

      return {
        renewal: updatedRenewal,
        decision: input.decision,
      };
    }),

  /**
   * Get renewals for calendar view (grouped by month)
   */
  getCalendarView: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number().min(0).max(11), // 0-indexed
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const today = new Date();

      // Get first and last day of month
      const monthStart = startOfMonth(
        new Date(input.year, input.month, 1)
      ).toISOString().split("T")[0];
      const monthEnd = endOfMonth(
        new Date(input.year, input.month, 1)
      ).toISOString().split("T")[0];

      const renewalsList = await db.query.renewalEvents.findMany({
        where: and(
          eq(renewalEvents.tenantId, tenantId),
          gte(renewalEvents.noticeDeadline, monthStart),
          lte(renewalEvents.noticeDeadline, monthEnd)
        ),
        with: {
          contract: {
            with: {
              vendor: true,
            },
          },
        },
      });

      // Group by date and calculate urgency
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const renewalsByDate = new Map<string, any[]>();

      renewalsList.forEach((renewal) => {
        const deadline = parseISO(renewal.noticeDeadline);
        const daysUntilDeadline = differenceInDays(deadline, today);

        const readiness = renewal.readinessScore;
        const totalScore = readiness?.totalScore ?? 0;
        const urgencyColor = getUrgencyColor(daysUntilDeadline, totalScore);

        const dateKey = renewal.noticeDeadline;
        const existing = renewalsByDate.get(dateKey) || [];

        renewalsByDate.set(dateKey, [
          ...existing,
          {
            ...renewal,
            daysUntilDeadline,
            readinessScore: totalScore,
            urgencyColor,
          },
        ]);
      });

      return Object.fromEntries(renewalsByDate);
    }),

  /**
   * Get dashboard stats (count by urgency)
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tenantId = ctx.tenantId;
      const today = new Date();

      // Get all upcoming renewals (next 90 days)
      const next90Days = new Date(today);
      next90Days.setDate(next90Days.getDate() + 90);

      const upcomingRenewals = await db.query.renewalEvents.findMany({
        where: and(
          eq(renewalEvents.tenantId, tenantId),
          or(
            eq(renewalEvents.status, "upcoming"),
            eq(renewalEvents.status, "in_review")
          ),
          lte(
            renewalEvents.noticeDeadline,
            next90Days.toISOString().split("T")[0]
          )
        ),
        with: {
          contract: {
            with: {
              vendor: true,
            },
          },
        },
        orderBy: [renewalEvents.noticeDeadline],
      });

      // Calculate urgency for each
      let greenCount = 0;
      let yellowCount = 0;
      let redCount = 0;

      const renewalsWithUrgency = upcomingRenewals.map((renewal) => {
        const deadline = parseISO(renewal.noticeDeadline);
        const daysUntilDeadline = differenceInDays(deadline, today);

        const readiness = renewal.readinessScore;
        const totalScore = readiness?.totalScore ?? 0;
        const urgencyColor = getUrgencyColor(daysUntilDeadline, totalScore);

        if (urgencyColor === "green") greenCount++;
        if (urgencyColor === "yellow") yellowCount++;
        if (urgencyColor === "red") redCount++;

        return {
          ...renewal,
          daysUntilDeadline,
          readinessScore: totalScore,
          urgencyColor,
        };
      });

      return {
        total: upcomingRenewals.length,
        green: greenCount,
        yellow: yellowCount,
        red: redCount,
        next3: renewalsWithUrgency.slice(0, 3), // Next 3 needing attention
      };
    } catch (error) {
      // Return empty stats if table doesn't exist or query fails
      // This is graceful degradation for when renewals feature isn't set up yet
      console.warn("[renewals.getDashboardStats] Query failed, returning empty stats:", error);
      return {
        total: 0,
        green: 0,
        yellow: 0,
        red: 0,
        next3: [],
      };
    }
  }),
});
