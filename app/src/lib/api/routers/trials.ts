/**
 * Trials tRPC Router
 * Handles trial management: create, track, decide (convert/extend/cancel)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, count } from "drizzle-orm";
import { differenceInDays, parseISO } from "date-fns";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { trials, requests } from "@/lib/db/schema";
import { scheduleTrialReminders, cancelTrialReminders, rescheduleTrialReminders } from "@/lib/queue/queues/trial-reminders";

export const trialsRouter = router({
  /**
   * Create trial from request form submission
   */
  createFromRequest: protectedProcedure
    .input(
      z.object({
        // Request fields
        title: z.string().min(3),
        description: z.string().optional(),
        category: z.enum(["saas", "services", "office", "travel", "hardware", "other"]),
        vendorName: z.string().optional(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        frequency: z.enum(["one-time", "monthly", "annually"]),
        urgency: z.enum(["low", "normal", "urgent"]).optional(),
        // Trial-specific fields
        trialEndDate: z.string(), // ISO date string
        trialSuccessCriteria: z
          .array(
            z.object({
              metric: z.string(),
              target: z.string(),
            })
          )
          .optional(),
        trialEstimatedAnnualCost: z.string().optional(),
        trialStakeholders: z.array(z.string().uuid()).optional(), // User IDs
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const tenantId = ctx.tenantId;
      const departmentId = ctx.user.departmentId!;

      // Validate end date is in future
      const endDate = parseISO(input.trialEndDate);
      const today = new Date();
      if (endDate <= today) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Trial end date must be in the future",
        });
      }

      // Generate request number
      const [{ count: existingCount }] = await db
        .select({ count: count() })
        .from(requests)
        .where(eq(requests.tenantId, tenantId));
      const requestNumber = `REQ-${new Date().getFullYear()}-${String(existingCount + 1).padStart(4, "0")}`;

      // Create request in draft status
      const [request] = await db
        .insert(requests)
        .values({
          tenantId,
          requesterId: userId,
          departmentId,
          requestNumber,
          title: input.title,
          description: input.description,
          category: input.category,
          vendorName: input.vendorName,
          amount: input.amount,
          currency: "EUR",
          frequency: input.frequency,
          urgency: input.urgency ?? "normal",
          status: "draft",
        })
        .returning();

      // Create trial record
      const [trial] = await db
        .insert(trials)
        .values({
          tenantId,
          initiatedById: userId,
          departmentId,
          toolName: input.title,
          category: input.category,
          description: input.description,
          startDate: new Date().toISOString().split("T")[0], // Today
          endDate: input.trialEndDate,
          successCriteria: input.trialSuccessCriteria ?? [],
          estimatedAnnualCost: input.trialEstimatedAnnualCost,
          stakeholders: input.trialStakeholders?.map((userId) => ({
            userId,
            role: "evaluator",
          })) ?? [],
          status: "active",
        })
        .returning();

      // Schedule reminder jobs (7d, 3d, 1d before expiry)
      await scheduleTrialReminders({
        trialId: trial.id,
        toolName: trial.toolName,
        endDate: trial.endDate,
        initiatedById: userId,
        stakeholders: trial.stakeholders as Array<{ userId: string; role: string }>,
        tenantId,
      });

      return {
        trial,
        request,
        message: `Trial created - reminders scheduled for 7, 3, and 1 days before expiry`,
      };
    }),

  /**
   * List all trials for tenant (with filters)
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["active", "extended", "converted", "cancelled", "expired"])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;

      const where = input.status
        ? and(eq(trials.tenantId, tenantId), eq(trials.status, input.status))
        : eq(trials.tenantId, tenantId);

      const trialsList = await db.query.trials.findMany({
        where,
        with: {
          vendor: true,
          department: true,
        },
        orderBy: [desc(trials.endDate)],
      });

      // Calculate days remaining for each trial
      const today = new Date();
      return trialsList.map((trial) => {
        const endDate = parseISO(trial.endDate);
        const daysRemaining = differenceInDays(endDate, today);

        // Determine urgency color
        let urgencyColor = "green";
        if (daysRemaining <= 1) urgencyColor = "red";
        else if (daysRemaining <= 3) urgencyColor = "amber";
        else if (daysRemaining <= 7) urgencyColor = "yellow";

        return {
          ...trial,
          daysRemaining,
          urgencyColor,
        };
      });
    }),

  /**
   * Get single trial by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;

      const trial = await db.query.trials.findFirst({
        where: and(eq(trials.id, input.id), eq(trials.tenantId, tenantId)),
        with: {
          vendor: true,
          department: true,
          convertedRequest: true,
        },
      });

      if (!trial) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trial not found",
        });
      }

      // Calculate status indicators
      const today = new Date();
      const endDate = parseISO(trial.endDate);
      const daysRemaining = differenceInDays(endDate, today);

      let urgencyColor = "green";
      if (daysRemaining <= 1) urgencyColor = "red";
      else if (daysRemaining <= 3) urgencyColor = "amber";
      else if (daysRemaining <= 7) urgencyColor = "yellow";

      return {
        ...trial,
        daysRemaining,
        urgencyColor,
      };
    }),

  /**
   * Make decision on trial: convert, extend, or cancel
   */
  makeDecision: protectedProcedure
    .input(
      z.object({
        trialId: z.string().uuid(),
        decision: z.enum(["convert", "extend", "cancel"]),
        decisionNotes: z.string().optional(),
        // For extensions
        newEndDate: z.string().optional(),
        // For conversions
        actualCriteria: z
          .array(
            z.object({
              metric: z.string(),
              target: z.string(),
              actual: z.string(),
              met: z.boolean(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const userId = ctx.user.id;

      // Fetch trial
      const trial = await db.query.trials.findFirst({
        where: and(eq(trials.id, input.trialId), eq(trials.tenantId, tenantId)),
      });

      if (!trial) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trial not found",
        });
      }

      if (trial.status !== "active" && trial.status !== "extended") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Trial is not active",
        });
      }

      // Handle decision logic
      let updatedTrial;
      let newRequestId: string | null = null;

      if (input.decision === "convert") {
        // Generate request number
        const [{ count: existingCount }] = await db
          .select({ count: count() })
          .from(requests)
          .where(eq(requests.tenantId, tenantId));
        const requestNumber = `REQ-${new Date().getFullYear()}-${String(existingCount + 1).padStart(4, "0")}`;

        // Create purchase request from trial
        const [request] = await db
          .insert(requests)
          .values({
            tenantId,
            requesterId: userId,
            departmentId: trial.departmentId!,
            requestNumber,
            title: trial.toolName,
            description: `Converted from trial - ${trial.description ?? ""}`,
            category: trial.category ?? "saas",
            vendorName: trial.toolName,
            amount: trial.estimatedAnnualCost?.replace(/[^\d.]/g, "") ?? "0",
            currency: "EUR",
            frequency: "annually",
            urgency: "normal",
            status: "draft",
          })
          .returning();

        newRequestId = request.id;

        // Update trial status
        [updatedTrial] = await db
          .update(trials)
          .set({
            status: "converted",
            decision: "buy",
            decisionDate: new Date(),
            decisionNotes: input.decisionNotes,
            convertedRequestId: request.id,
            successCriteria: input.actualCriteria
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? (input.actualCriteria as any)
              : trial.successCriteria,
            updatedAt: new Date(),
          })
          .where(eq(trials.id, input.trialId))
          .returning();

        // Cancel remaining reminders
        await cancelTrialReminders(input.trialId);
      } else if (input.decision === "extend") {
        if (!input.newEndDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "New end date required for extension",
          });
        }

        const newEndDate = parseISO(input.newEndDate);
        if (newEndDate <= new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "New end date must be in the future",
          });
        }

        // Update trial
        [updatedTrial] = await db
          .update(trials)
          .set({
            status: "extended",
            endDate: input.newEndDate,
            decision: "extend",
            decisionDate: new Date(),
            decisionNotes: input.decisionNotes,
            updatedAt: new Date(),
          })
          .where(eq(trials.id, input.trialId))
          .returning();

        // Reschedule reminders with new end date
        await rescheduleTrialReminders({
          trialId: trial.id,
          toolName: trial.toolName,
          endDate: input.newEndDate,
          initiatedById: trial.initiatedById,
          stakeholders: trial.stakeholders as Array<{ userId: string; role: string }>,
          tenantId,
        });
      } else {
        // Cancel
        [updatedTrial] = await db
          .update(trials)
          .set({
            status: "cancelled",
            decision: "cancel",
            decisionDate: new Date(),
            decisionNotes: input.decisionNotes,
            updatedAt: new Date(),
          })
          .where(eq(trials.id, input.trialId))
          .returning();

        // Cancel remaining reminders
        await cancelTrialReminders(input.trialId);
      }

      return {
        trial: updatedTrial,
        newRequestId,
        decision: input.decision,
        newEndDate: input.decision === "extend" ? input.newEndDate : null,
      };
    }),

  /**
   * Update success criteria with actual values
   */
  updateCriteria: protectedProcedure
    .input(
      z.object({
        trialId: z.string().uuid(),
        criteria: z.array(
          z.object({
            metric: z.string(),
            target: z.string(),
            actual: z.string(),
            met: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;

      const trial = await db.query.trials.findFirst({
        where: and(eq(trials.id, input.trialId), eq(trials.tenantId, tenantId)),
      });

      if (!trial) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trial not found",
        });
      }

      const [updatedTrial] = await db
        .update(trials)
        .set({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          successCriteria: input.criteria as any,
          updatedAt: new Date(),
        })
        .where(eq(trials.id, input.trialId))
        .returning();

      return updatedTrial;
    }),
});
