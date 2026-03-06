/**
 * Subscriptions router
 * Handles subscription creation, management, and request-to-subscription conversion
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { subscriptions } from "@/lib/db/schema/subscriptions";
import { requests } from "@/lib/db/schema/requests";
import { eq, and, inArray, desc } from "drizzle-orm";

export const subscriptionsRouter = router({
  /**
   * List subscriptions with filters
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["trial", "active", "paused", "cancelled", "expired"]).optional(),
        category: z.string().optional(),
        vendorId: z.string().uuid().optional(),
        departmentId: z.string().uuid().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, tenantId } = ctx;

      const conditions = [eq(subscriptions.tenantId, tenantId)];

      if (input?.status) {
        conditions.push(eq(subscriptions.status, input.status));
      }
      if (input?.category) {
        conditions.push(eq(subscriptions.category, input.category));
      }
      if (input?.vendorId) {
        conditions.push(eq(subscriptions.vendorId, input.vendorId));
      }
      if (input?.departmentId) {
        conditions.push(eq(subscriptions.departmentId, input.departmentId));
      }

      return await db.query.subscriptions.findMany({
        where: and(...conditions),
        orderBy: [desc(subscriptions.createdAt)],
        limit: 100,
        with: {
          vendor: true,
          department: true,
        },
      });
    }),

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

  /**
   * Update subscription details
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          plan: z.string().optional(),
          seats: z.number().int().positive().optional(),
          activeSeats: z.number().int().min(0).optional(),
          costPerSeat: z.string().optional(),
          totalCost: z.string().optional(),
          billingCycle: z.enum(["monthly", "quarterly", "annually"]).optional(),
          status: z.enum(["trial", "active", "paused", "cancelled", "expired"]).optional(),
          endDate: z.string().optional(),
          ownerId: z.string().uuid().optional(),
          description: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, tenantId } = ctx;

      // Verify subscription exists and belongs to tenant
      const [existing] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      if (existing.tenantId !== tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Update the subscription
      const [updated] = await db
        .update(subscriptions)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Cancel a subscription
   */
  cancel: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        endDate: z.string().optional(), // If not provided, use today
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, tenantId } = ctx;

      // Verify subscription exists and belongs to tenant
      const [existing] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      if (existing.tenantId !== tenantId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      if (existing.status === "cancelled") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subscription is already cancelled",
        });
      }

      // Cancel the subscription
      const [cancelled] = await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          endDate: input.endDate || new Date().toISOString().split("T")[0],
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, input.id))
        .returning();

      return cancelled;
    }),

  /**
   * Get spend metrics across subscriptions
   */
  spendMetrics: protectedProcedure
    .input(
      z.object({
        status: z.array(z.enum(["trial", "active", "paused", "cancelled", "expired"])).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, tenantId } = ctx;

      const conditions = [eq(subscriptions.tenantId, tenantId)];

      if (input?.status) {
        conditions.push(inArray(subscriptions.status, input.status));
      }

      const subs = await db.query.subscriptions.findMany({
        where: and(...conditions),
        with: {
          vendor: true,
          department: true,
        },
      });

      // Calculate totals
      let monthlyTotal = 0;
      let annualTotal = 0;

      const byCategory: Record<string, { monthly: number; annual: number; count: number }> = {};
      const byVendor: Record<string, { monthly: number; annual: number; count: number; vendorName: string }> = {};
      const byDepartment: Record<string, { monthly: number; annual: number; count: number; departmentName: string }> = {};

      for (const sub of subs) {
        const cost = parseFloat(sub.totalCost);
        let monthlyCost = 0;

        // Normalize to monthly cost
        if (sub.billingCycle === "monthly") {
          monthlyCost = cost;
        } else if (sub.billingCycle === "quarterly") {
          monthlyCost = cost / 3;
        } else if (sub.billingCycle === "annually") {
          monthlyCost = cost / 12;
        }

        const annualCost = monthlyCost * 12;

        monthlyTotal += monthlyCost;
        annualTotal += annualCost;

        // By category
        if (!byCategory[sub.category]) {
          byCategory[sub.category] = { monthly: 0, annual: 0, count: 0 };
        }
        byCategory[sub.category].monthly += monthlyCost;
        byCategory[sub.category].annual += annualCost;
        byCategory[sub.category].count += 1;

        // By vendor
        if (sub.vendor) {
          if (!byVendor[sub.vendorId]) {
            byVendor[sub.vendorId] = {
              monthly: 0,
              annual: 0,
              count: 0,
              vendorName: sub.vendor.name,
            };
          }
          byVendor[sub.vendorId].monthly += monthlyCost;
          byVendor[sub.vendorId].annual += annualCost;
          byVendor[sub.vendorId].count += 1;
        }

        // By department
        if (sub.department) {
          if (!byDepartment[sub.departmentId!]) {
            byDepartment[sub.departmentId!] = {
              monthly: 0,
              annual: 0,
              count: 0,
              departmentName: sub.department.name,
            };
          }
          byDepartment[sub.departmentId!].monthly += monthlyCost;
          byDepartment[sub.departmentId!].annual += annualCost;
          byDepartment[sub.departmentId!].count += 1;
        }
      }

      return {
        totalMonthly: monthlyTotal,
        totalAnnual: annualTotal,
        subscriptionCount: subs.length,
        byCategory,
        byVendor,
        byDepartment,
      };
    }),

  /**
   * Find subscriptions with low seat utilization
   */
  seatUtilization: protectedProcedure
    .input(
      z.object({
        threshold: z.number().min(0).max(100).default(30), // Default: flag if <30% utilization
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, tenantId } = ctx;
      const threshold = input?.threshold ?? 30;

      // Get all active subscriptions with seat data
      const subs = await db.query.subscriptions.findMany({
        where: and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, "active")
        ),
        with: {
          vendor: true,
          department: true,
        },
      });

      // Filter to subscriptions with underutilized seats
      const underutilized = subs
        .filter((sub) => sub.seats && sub.activeSeats != null)
        .map((sub) => {
          const utilizationPercent = ((sub.activeSeats! / sub.seats!) * 100);
          const wastedSeats = sub.seats! - sub.activeSeats!;
          const costPerSeat = sub.costPerSeat ? parseFloat(sub.costPerSeat) : 0;
          const wastedCost = wastedSeats * costPerSeat;

          return {
            subscription: sub,
            seats: sub.seats!,
            activeSeats: sub.activeSeats!,
            utilizationPercent,
            wastedSeats,
            wastedCost,
          };
        })
        .filter((item) => item.utilizationPercent < threshold)
        .sort((a, b) => b.wastedCost - a.wastedCost); // Sort by wasted cost descending

      const totalWastedSeats = underutilized.reduce((sum, item) => sum + item.wastedSeats, 0);
      const totalWastedCost = underutilized.reduce((sum, item) => sum + item.wastedCost, 0);

      return {
        underutilized,
        totalWastedSeats,
        totalWastedCost,
        threshold,
      };
    }),
});
