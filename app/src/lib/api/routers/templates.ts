/**
 * tRPC Templates Router
 * Handles request template creation, listing, and usage
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { requestTemplates } from "@/lib/db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createAuditLog, AuditAction } from "@/lib/monitoring/audit";

export const templatesRouter = router({
  /**
   * List templates accessible to the user
   * Includes personal templates + public org templates
   * Sorted by popularity (useCount DESC)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db.query.requestTemplates.findMany({
      where: and(
        eq(requestTemplates.tenantId, ctx.tenantId),
        or(
          eq(requestTemplates.createdById, ctx.user.id), // User's own templates
          eq(requestTemplates.isPublic, true) // Public org templates
        )
      ),
      orderBy: [desc(requestTemplates.useCount), desc(requestTemplates.createdAt)],
      with: {
        creator: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return templates;
  }),

  /**
   * Get a single template by ID
   * Used for preview before creating request
   */
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.query.requestTemplates.findFirst({
        where: and(
          eq(requestTemplates.id, input.id),
          eq(requestTemplates.tenantId, ctx.tenantId),
          or(
            eq(requestTemplates.createdById, ctx.user.id),
            eq(requestTemplates.isPublic, true)
          )
        ),
        with: {
          creator: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found or access denied",
        });
      }

      return template;
    }),

  /**
   * Create a new template from request data
   * Can be personal or public (org-wide)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Template name must be at least 3 characters"),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
        templateData: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          category: z.enum(["saas", "services", "office", "travel", "hardware", "other"]).optional(),
          vendorName: z.string().optional(),
          amount: z.string().optional(),
          frequency: z.enum(["one-time", "monthly", "annually"]).optional(),
          quantity: z.number().optional(),
          urgency: z.enum(["low", "normal", "urgent"]).optional(),
          isTrial: z.boolean().optional(),
          trialEndDate: z.string().optional(),
          trialSuccessCriteria: z.array(z.object({ metric: z.string(), target: z.string() })).optional(),
          trialEstimatedAnnualCost: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Insert template
      const [template] = await ctx.db
        .insert(requestTemplates)
        .values({
          tenantId: ctx.tenantId,
          createdById: ctx.user.id,
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
          templateData: input.templateData,
          useCount: 0,
        })
        .returning();

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: "template.created",
        entityType: "template",
        entityId: template.id,
        description: `Created template: ${input.name}${input.isPublic ? " (public)" : " (private)"}`,
        metadata: {
          templateName: input.name,
          isPublic: input.isPublic,
        },
      });

      return template;
    }),

  /**
   * Update an existing template
   * Only the creator can update their templates
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(3).optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
        templateData: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            category: z.enum(["saas", "services", "office", "travel", "hardware", "other"]).optional(),
            vendorName: z.string().optional(),
            amount: z.string().optional(),
            frequency: z.enum(["one-time", "monthly", "annually"]).optional(),
            quantity: z.number().optional(),
            urgency: z.enum(["low", "normal", "urgent"]).optional(),
            isTrial: z.boolean().optional(),
            trialEndDate: z.string().optional(),
            trialSuccessCriteria: z.array(z.object({ metric: z.string(), target: z.string() })).optional(),
            trialEstimatedAnnualCost: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.requestTemplates.findFirst({
        where: and(
          eq(requestTemplates.id, input.id),
          eq(requestTemplates.tenantId, ctx.tenantId),
          eq(requestTemplates.createdById, ctx.user.id)
        ),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found or you don't have permission to update it",
        });
      }

      // Update template
      const [updated] = await ctx.db
        .update(requestTemplates)
        .set({
          name: input.name ?? existing.name,
          description: input.description ?? existing.description,
          isPublic: input.isPublic ?? existing.isPublic,
          templateData: input.templateData ?? existing.templateData,
          updatedAt: new Date(),
        })
        .where(eq(requestTemplates.id, input.id))
        .returning();

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: "template.updated",
        entityType: "template",
        entityId: input.id,
        description: `Updated template: ${updated.name}`,
        before: {
          name: existing.name,
          isPublic: existing.isPublic,
        },
        after: {
          name: updated.name,
          isPublic: updated.isPublic,
        },
      });

      return updated;
    }),

  /**
   * Delete a template
   * Only the creator can delete their templates
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.requestTemplates.findFirst({
        where: and(
          eq(requestTemplates.id, input.id),
          eq(requestTemplates.tenantId, ctx.tenantId),
          eq(requestTemplates.createdById, ctx.user.id)
        ),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found or you don't have permission to delete it",
        });
      }

      // Delete template
      await ctx.db.delete(requestTemplates).where(eq(requestTemplates.id, input.id));

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: "template.deleted",
        entityType: "template",
        entityId: input.id,
        description: `Deleted template: ${existing.name}`,
        metadata: {
          templateName: existing.name,
          useCount: existing.useCount,
        },
      });

      return { success: true };
    }),

  /**
   * Increment use count when a template is used
   * Called when creating a request from a template
   */
  incrementUseCount: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify access
      const template = await ctx.db.query.requestTemplates.findFirst({
        where: and(
          eq(requestTemplates.id, input.id),
          eq(requestTemplates.tenantId, ctx.tenantId),
          or(
            eq(requestTemplates.createdById, ctx.user.id),
            eq(requestTemplates.isPublic, true)
          )
        ),
      });

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found or access denied",
        });
      }

      // Increment use count
      await ctx.db
        .update(requestTemplates)
        .set({
          useCount: sql`${requestTemplates.useCount} + 1`,
        })
        .where(eq(requestTemplates.id, input.id));

      return { success: true };
    }),
});
