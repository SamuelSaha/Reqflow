/**
 * tRPC router for budgets
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { budgets } from "../../db/schema";
import { eq, and } from "drizzle-orm";

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
});
