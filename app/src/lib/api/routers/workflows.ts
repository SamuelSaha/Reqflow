/**
 * tRPC Workflows Router
 * Manages approval workflow templates for admins
 */

import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { approvalWorkflows } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Hardcoded thresholds from approval-router.ts (for UI reference)
export const WORKFLOW_THRESHOLDS = {
  AUTO_APPROVE: 0,
  FINANCE_REVIEW: 1000,
  EXECUTIVE_REVIEW: 10000,
  BUDGET_ESCALATION_PCT: 90,
  LEGAL_REVIEW_AMOUNT: 25000,
} as const;

const approvalChainStepSchema = z.object({
  step: z.number(),
  type: z.enum(["role", "user", "department_head", "custom"]),
  value: z.string(),
  required: z.enum(["required", "optional", "parallel"]),
  condition: z
    .object({
      field: z.string(),
      operator: z.string(),
      value: z.unknown(),
    })
    .optional(),
});

export const workflowsRouter = router({
  /**
   * List all workflows for the organization
   */
  list: adminProcedure.query(async ({ ctx }) => {
    const workflows = await ctx.db.query.approvalWorkflows.findMany({
      where: eq(approvalWorkflows.tenantId, ctx.tenantId),
      orderBy: [desc(approvalWorkflows.createdAt)],
    });

    return workflows.map((wf) => ({
      id: wf.id,
      name: wf.name,
      description: wf.description,
      isActive: wf.isActive,
      isDefault: wf.isDefault,
      conditions: wf.conditions,
      approvalChainLength: wf.approvalChain.length,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
    }));
  }),

  /**
   * Get single workflow by ID
   */
  getById: adminProcedure
    .input(z.object({ workflowId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const workflow = await ctx.db.query.approvalWorkflows.findFirst({
        where: and(
          eq(approvalWorkflows.id, input.workflowId),
          eq(approvalWorkflows.tenantId, ctx.tenantId)
        ),
      });

      if (!workflow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      }

      return workflow;
    }),

  /**
   * Create a new workflow
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        conditions: z.object({
          amountMin: z.number().optional(),
          amountMax: z.number().optional(),
          categories: z.array(z.string()).optional(),
          departments: z.array(z.string().uuid()).optional(),
          vendorTypes: z.array(z.string()).optional(),
        }),
        approvalChain: z.array(approvalChainStepSchema),
        isActive: z.boolean().default(true),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate approval chain has at least one step
      if (input.approvalChain.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Approval chain must have at least one step",
        });
      }

      // If setting as default, unset other defaults
      if (input.isDefault) {
        await ctx.db
          .update(approvalWorkflows)
          .set({ isDefault: false })
          .where(eq(approvalWorkflows.tenantId, ctx.tenantId));
      }

      const [workflow] = await ctx.db
        .insert(approvalWorkflows)
        .values({
          tenantId: ctx.tenantId,
          name: input.name,
          description: input.description,
          conditions: input.conditions,
          approvalChain: input.approvalChain,
          isActive: input.isActive,
          isDefault: input.isDefault,
          escalation: { enabled: false },
        })
        .returning();

      return { success: true, workflow };
    }),

  /**
   * Update workflow
   */
  update: adminProcedure
    .input(
      z.object({
        workflowId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        conditions: z
          .object({
            amountMin: z.number().optional(),
            amountMax: z.number().optional(),
            categories: z.array(z.string()).optional(),
            departments: z.array(z.string().uuid()).optional(),
            vendorTypes: z.array(z.string()).optional(),
          })
          .optional(),
        approvalChain: z.array(approvalChainStepSchema).optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate approval chain if provided
      if (input.approvalChain && input.approvalChain.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Approval chain must have at least one step",
        });
      }

      // If setting as default, unset other defaults
      if (input.isDefault) {
        await ctx.db
          .update(approvalWorkflows)
          .set({ isDefault: false })
          .where(
            and(
              eq(approvalWorkflows.tenantId, ctx.tenantId),
              // Don't unset the workflow we're updating
              eq(approvalWorkflows.id, input.workflowId)
            )
          );
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.name) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.conditions) updateData.conditions = input.conditions;
      if (input.approvalChain) updateData.approvalChain = input.approvalChain;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.isDefault !== undefined) updateData.isDefault = input.isDefault;

      const [updated] = await ctx.db
        .update(approvalWorkflows)
        .set(updateData)
        .where(
          and(
            eq(approvalWorkflows.id, input.workflowId),
            eq(approvalWorkflows.tenantId, ctx.tenantId)
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      return { success: true, workflow: updated };
    }),

  /**
   * Delete workflow
   */
  delete: adminProcedure
    .input(z.object({ workflowId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if this is the default workflow
      const workflow = await ctx.db.query.approvalWorkflows.findFirst({
        where: and(
          eq(approvalWorkflows.id, input.workflowId),
          eq(approvalWorkflows.tenantId, ctx.tenantId)
        ),
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      if (workflow.isDefault) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete the default workflow. Set another workflow as default first.",
        });
      }

      await ctx.db
        .delete(approvalWorkflows)
        .where(
          and(
            eq(approvalWorkflows.id, input.workflowId),
            eq(approvalWorkflows.tenantId, ctx.tenantId)
          )
        );

      return { success: true };
    }),

  /**
   * Toggle workflow active status
   */
  toggleActive: adminProcedure
    .input(
      z.object({
        workflowId: z.string().uuid(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(approvalWorkflows)
        .set({ isActive: input.isActive, updatedAt: new Date() })
        .where(
          and(
            eq(approvalWorkflows.id, input.workflowId),
            eq(approvalWorkflows.tenantId, ctx.tenantId)
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      return { success: true, workflow: updated };
    }),

  /**
   * Set workflow as default
   */
  setDefault: adminProcedure
    .input(z.object({ workflowId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Unset all other defaults
      await ctx.db
        .update(approvalWorkflows)
        .set({ isDefault: false })
        .where(eq(approvalWorkflows.tenantId, ctx.tenantId));

      // Set this one as default
      const [updated] = await ctx.db
        .update(approvalWorkflows)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(
          and(
            eq(approvalWorkflows.id, input.workflowId),
            eq(approvalWorkflows.tenantId, ctx.tenantId)
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      return { success: true, workflow: updated };
    }),

  /**
   * Get current workflow thresholds (hardcoded values from approval-router.ts)
   */
  getThresholds: adminProcedure.query(() => {
    return WORKFLOW_THRESHOLDS;
  }),

  /**
   * Test workflow matching with mock request data
   */
  testWorkflow: adminProcedure
    .input(
      z.object({
        workflowId: z.string().uuid(),
        testRequest: z.object({
          amount: z.number(),
          category: z.string(),
          departmentId: z.string().uuid().optional(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const workflow = await ctx.db.query.approvalWorkflows.findFirst({
        where: and(
          eq(approvalWorkflows.id, input.workflowId),
          eq(approvalWorkflows.tenantId, ctx.tenantId)
        ),
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      // Calculate match score (same logic as approval-router.ts)
      const conditions = workflow.conditions;
      let score = 0;
      let matches = true;

      // Amount range check
      if (
        conditions.amountMin !== undefined &&
        input.testRequest.amount < conditions.amountMin
      ) {
        matches = false;
      }
      if (
        conditions.amountMax !== undefined &&
        input.testRequest.amount > conditions.amountMax
      ) {
        matches = false;
      }
      if (
        matches &&
        (conditions.amountMin !== undefined ||
          conditions.amountMax !== undefined)
      ) {
        score += 1;
      }

      // Category check
      if (conditions.categories && conditions.categories.length > 0) {
        if (conditions.categories.includes(input.testRequest.category)) {
          score += 2;
        } else {
          matches = false;
        }
      }

      // Department check
      if (conditions.departments && conditions.departments.length > 0) {
        if (
          input.testRequest.departmentId &&
          conditions.departments.includes(input.testRequest.departmentId)
        ) {
          score += 4;
        } else {
          matches = false;
        }
      }

      return {
        matches,
        score,
        workflow: {
          id: workflow.id,
          name: workflow.name,
          approvalChain: workflow.approvalChain,
        },
        explanation: matches
          ? `This workflow matches with specificity score ${score}`
          : "This workflow does not match the test request",
      };
    }),
});
