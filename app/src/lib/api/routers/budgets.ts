/**
 * tRPC router for budgets
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { budgets, requests } from "../../db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export const budgetsRouter = router({
  /**
   * List all budgets for organization
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.query.budgets.findMany({
      where: eq(budgets.tenantId, ctx.tenantId),
      with: {
        department: true,
      },
    });

    return items;
  }),

  /**
   * Get budget summary for department
   */
  getDepartmentSummary: protectedProcedure
    .input(z.object({ departmentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const departmentBudgets = await ctx.db.query.budgets.findMany({
        where: and(
          eq(budgets.tenantId, ctx.tenantId),
          eq(budgets.departmentId, input.departmentId)
        ),
      });

      // Calculate totals
      const summary = departmentBudgets.reduce(
        (acc, budget) => {
          const allocated = parseFloat(budget.allocated);
          const committed = parseFloat(budget.committed);
          const spent = parseFloat(budget.spent);

          return {
            totalAllocated: acc.totalAllocated + allocated,
            totalCommitted: acc.totalCommitted + committed,
            totalSpent: acc.totalSpent + spent,
            totalRemaining:
              acc.totalRemaining + (allocated - committed - spent),
          };
        },
        {
          totalAllocated: 0,
          totalCommitted: 0,
          totalSpent: 0,
          totalRemaining: 0,
        }
      );

      return {
        budgets: departmentBudgets,
        summary,
      };
    }),

  /**
   * Check if amount can be committed against budget
   */
  checkAvailability: protectedProcedure
    .input(
      z.object({
        budgetId: z.string().uuid(),
        amount: z.number().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const budget = await ctx.db.query.budgets.findFirst({
        where: and(
          eq(budgets.id, input.budgetId),
          eq(budgets.tenantId, ctx.tenantId)
        ),
      });

      if (!budget) {
        return { available: false, reason: "Budget not found" };
      }

      const allocated = parseFloat(budget.allocated);
      const committed = parseFloat(budget.committed);
      const spent = parseFloat(budget.spent);
      const remaining = allocated - committed - spent;

      // Check hard limit
      if (input.amount > remaining) {
        return {
          available: false,
          reason: "Exceeds available budget",
          remaining,
        };
      }

      // Check soft limit (warning)
      const utilization = (committed + spent + input.amount) / allocated;
      const softLimit = parseFloat(budget.softLimit || "0.8");

      if (utilization >= softLimit) {
        return {
          available: true,
          warning: `Budget will be ${(utilization * 100).toFixed(1)}% utilized`,
          remaining,
        };
      }

      return {
        available: true,
        remaining,
      };
    }),

  /**
   * ADMIN: Get single budget for editing
   */
  getById: adminProcedure
    .input(z.object({ budgetId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const budget = await ctx.db.query.budgets.findFirst({
        where: and(
          eq(budgets.id, input.budgetId),
          eq(budgets.tenantId, ctx.tenantId)
        ),
        with: {
          department: true,
        },
      });

      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      return budget;
    }),

  /**
   * ADMIN: Create new budget
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        type: z.enum(["company", "department", "category", "project"]),
        departmentId: z.string().uuid().optional(),
        category: z
          .enum(["saas", "services", "office", "travel", "hardware", "other"])
          .optional(),
        allocated: z.number().positive(),
        period: z.enum(["monthly", "quarterly", "annually"]),
        startDate: z.string(), // ISO date string
        endDate: z.string(), // ISO date string
        softLimit: z.number().min(0).max(1).optional(),
        hardLimit: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate dates
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      if (endDate <= startDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      // Validate type-specific requirements
      if (
        input.type === "department" &&
        (!input.departmentId || input.category)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Department budgets require departmentId and no category",
        });
      }

      if (input.type === "category" && (!input.category || input.departmentId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category budgets require category and no departmentId",
        });
      }

      const [budget] = await ctx.db
        .insert(budgets)
        .values({
          tenantId: ctx.tenantId,
          name: input.name,
          type: input.type,
          departmentId: input.departmentId,
          category: input.category,
          allocated: input.allocated.toString(),
          period: input.period,
          startDate: input.startDate,
          endDate: input.endDate,
          softLimit: input.softLimit?.toString() || "0.80",
          hardLimit: input.hardLimit?.toString() || "1.00",
        })
        .returning();

      return { success: true, budget };
    }),

  /**
   * ADMIN: Update budget
   */
  update: adminProcedure
    .input(
      z.object({
        budgetId: z.string().uuid(),
        name: z.string().min(1).max(200).optional(),
        allocated: z.number().positive().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        softLimit: z.number().min(0).max(1).optional(),
        hardLimit: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current budget
      const current = await ctx.db.query.budgets.findFirst({
        where: and(
          eq(budgets.id, input.budgetId),
          eq(budgets.tenantId, ctx.tenantId)
        ),
      });

      if (!current) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Budget not found",
        });
      }

      // Validate allocated amount if provided
      if (input.allocated !== undefined) {
        const committed = parseFloat(current.committed);
        const spent = parseFloat(current.spent);

        if (input.allocated < committed + spent) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot reduce allocated amount below committed + spent (€${(committed + spent).toFixed(2)})`,
          });
        }
      }

      // Validate dates
      if (input.startDate || input.endDate) {
        const startDate = new Date(input.startDate || current.startDate);
        const endDate = new Date(input.endDate || current.endDate);

        if (endDate <= startDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End date must be after start date",
          });
        }
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.name) updateData.name = input.name;
      if (input.allocated !== undefined)
        updateData.allocated = input.allocated.toString();
      if (input.startDate) updateData.startDate = input.startDate;
      if (input.endDate) updateData.endDate = input.endDate;
      if (input.softLimit !== undefined)
        updateData.softLimit = input.softLimit.toString();
      if (input.hardLimit !== undefined)
        updateData.hardLimit = input.hardLimit.toString();

      const [updated] = await ctx.db
        .update(budgets)
        .set(updateData)
        .where(
          and(
            eq(budgets.id, input.budgetId),
            eq(budgets.tenantId, ctx.tenantId)
          )
        )
        .returning();

      return { success: true, budget: updated };
    }),

  /**
   * ADMIN: Delete budget
   */
  delete: adminProcedure
    .input(z.object({ budgetId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check for linked requests
      const linkedRequests = await ctx.db.query.requests.findMany({
        where: eq(requests.budgetId, input.budgetId),
      });

      if (linkedRequests.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete budget with ${linkedRequests.length} linked request(s)`,
        });
      }

      const [deleted] = await ctx.db
        .delete(budgets)
        .where(
          and(
            eq(budgets.id, input.budgetId),
            eq(budgets.tenantId, ctx.tenantId)
          )
        )
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Budget not found",
        });
      }

      return { success: true };
    }),

  /**
   * ADMIN: Get budget analytics
   */
  getAnalytics: adminProcedure.query(async ({ ctx }) => {
    const allBudgets = await ctx.db.query.budgets.findMany({
      where: eq(budgets.tenantId, ctx.tenantId),
      with: {
        department: true,
      },
    });

    // Overall stats
    const overall = allBudgets.reduce(
      (acc, budget) => {
        const allocated = parseFloat(budget.allocated);
        const committed = parseFloat(budget.committed);
        const spent = parseFloat(budget.spent);

        return {
          totalAllocated: acc.totalAllocated + allocated,
          totalCommitted: acc.totalCommitted + committed,
          totalSpent: acc.totalSpent + spent,
          totalRemaining: acc.totalRemaining + (allocated - committed - spent),
        };
      },
      {
        totalAllocated: 0,
        totalCommitted: 0,
        totalSpent: 0,
        totalRemaining: 0,
      }
    );

    // By department
    const byDepartment = allBudgets
      .filter((b) => b.department)
      .reduce((acc, budget) => {
        const deptName = budget.department!.name;
        if (!acc[deptName]) {
          acc[deptName] = { allocated: 0, committed: 0, spent: 0 };
        }

        acc[deptName].allocated += parseFloat(budget.allocated);
        acc[deptName].committed += parseFloat(budget.committed);
        acc[deptName].spent += parseFloat(budget.spent);

        return acc;
      }, {} as Record<string, { allocated: number; committed: number; spent: number }>);

    // By category
    const byCategory = allBudgets
      .filter((b) => b.category)
      .reduce((acc, budget) => {
        const cat = budget.category!;
        if (!acc[cat]) {
          acc[cat] = { allocated: 0, committed: 0, spent: 0 };
        }

        acc[cat].allocated += parseFloat(budget.allocated);
        acc[cat].committed += parseFloat(budget.committed);
        acc[cat].spent += parseFloat(budget.spent);

        return acc;
      }, {} as Record<string, { allocated: number; committed: number; spent: number }>);

    // Top consuming departments
    const topDepartments = Object.entries(byDepartment)
      .map(([name, data]) => ({
        name,
        spent: data.spent,
        utilization:
          data.allocated > 0
            ? ((data.committed + data.spent) / data.allocated) * 100
            : 0,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);

    // Budget health (utilization > 80%)
    const atRisk = allBudgets.filter((budget) => {
      const allocated = parseFloat(budget.allocated);
      const committed = parseFloat(budget.committed);
      const spent = parseFloat(budget.spent);
      const utilization = (committed + spent) / allocated;
      const softLimit = parseFloat(budget.softLimit || "0.8");
      return utilization >= softLimit;
    });

    return {
      overall,
      byDepartment,
      byCategory,
      topDepartments,
      atRisk: atRisk.map((b) => ({
        id: b.id,
        name: b.name,
        utilization:
          (parseFloat(b.committed) + parseFloat(b.spent)) /
          parseFloat(b.allocated),
        allocated: parseFloat(b.allocated),
        remaining:
          parseFloat(b.allocated) -
          parseFloat(b.committed) -
          parseFloat(b.spent),
      })),
    };
  }),
});
