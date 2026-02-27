/**
 * tRPC router for categories
 * Manages custom spend categories for classification
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { categories } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createAuditLog, AuditAction } from "../../monitoring/audit";

export const categoriesRouter = router({
  /**
   * List all active categories for the tenant
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.query.categories.findMany({
      where: and(
        eq(categories.tenantId, ctx.tenantId),
        eq(categories.isActive, true)
      ),
      orderBy: [desc(categories.createdAt)],
    });

    return items;
  }),

  /**
   * Get single category by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.query.categories.findFirst({
        where: and(
          eq(categories.id, input.id),
          eq(categories.tenantId, ctx.tenantId)
        ),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  /**
   * Create new category
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
        description: z.string().max(500).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        icon: z.string().max(50).optional(),
        glAccountCode: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check for duplicate slug within tenant
      const existing = await ctx.db.query.categories.findFirst({
        where: and(
          eq(categories.tenantId, ctx.tenantId),
          eq(categories.slug, input.slug)
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this slug already exists",
        });
      }

      // Create category
      const [newCategory] = await ctx.db
        .insert(categories)
        .values({
          ...input,
          tenantId: ctx.tenantId,
          isSystem: false,
        })
        .returning();

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name ?? "Unknown",
        action: "category.created",
        entityType: "category",
        entityId: newCategory.id,
        description: `Created category: ${newCategory.name}`,
        metadata: { slug: newCategory.slug },
      });

      return newCategory;
    }),

  /**
   * Update existing category
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().max(500).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        icon: z.string().max(50).optional(),
        glAccountCode: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Verify category exists and belongs to tenant
      const category = await ctx.db.query.categories.findFirst({
        where: and(
          eq(categories.id, id),
          eq(categories.tenantId, ctx.tenantId)
        ),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Prevent editing system categories
      if (category.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "System categories cannot be modified",
        });
      }

      // If slug is being updated, check for duplicates
      if (updates.slug && updates.slug !== category.slug) {
        const existing = await ctx.db.query.categories.findFirst({
          where: and(
            eq(categories.tenantId, ctx.tenantId),
            eq(categories.slug, updates.slug)
          ),
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A category with this slug already exists",
          });
        }
      }

      // Update category
      const [updated] = await ctx.db
        .update(categories)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, id))
        .returning();

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name ?? "Unknown",
        action: "category.updated",
        entityType: "category",
        entityId: updated.id,
        description: `Updated category: ${updated.name}`,
        before: category,
        after: updated,
      });

      return updated;
    }),

  /**
   * Soft delete category (mark as inactive)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify category exists and belongs to tenant
      const category = await ctx.db.query.categories.findFirst({
        where: and(
          eq(categories.id, input.id),
          eq(categories.tenantId, ctx.tenantId)
        ),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Prevent deleting system categories
      if (category.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "System categories cannot be deleted",
        });
      }

      // Soft delete (mark as inactive)
      await ctx.db
        .update(categories)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, input.id));

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name ?? "Unknown",
        action: "category.deleted",
        entityType: "category",
        entityId: category.id,
        description: `Deleted category: ${category.name}`,
      });

      return { success: true };
    }),
});
