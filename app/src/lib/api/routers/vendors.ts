/**
 * tRPC Vendor Management Router
 * Handles vendor CRUD, spend aggregation, and compliance tracking
 */

import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { vendors, subscriptions, contracts } from "@/lib/db/schema";
import { eq, and, sql, ilike, or, desc } from "drizzle-orm";
import { createAuditLog, AuditAction } from "@/lib/monitoring/audit";
import { env } from "@/lib/env";

export const vendorsRouter = router({
  /**
   * List all vendors with spend aggregation
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        industry: z.string().optional(),
        complianceTier: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(vendors.tenantId, ctx.tenantId)];

      // Apply filters
      if (input.search) {
        conditions.push(
          or(
            ilike(vendors.name, `%${input.search}%`),
            ilike(vendors.legalName, `%${input.search}%`)
          )!
        );
      }
      if (input.industry) {
        conditions.push(eq(vendors.industry, input.industry));
      }
      if (input.complianceTier) {
        conditions.push(eq(vendors.complianceTier, input.complianceTier));
      }
      if (input.status) {
        conditions.push(eq(vendors.status, input.status));
      }

      // Aggregate spend and subscription count
      const vendorList = await ctx.db
        .select({
          id: vendors.id,
          name: vendors.name,
          legalName: vendors.legalName,
          industry: vendors.industry,
          complianceTier: vendors.complianceTier,
          status: vendors.status,
          website: vendors.website,
          createdAt: vendors.createdAt,
          // Aggregate metrics
          activeSubscriptions: sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${subscriptions.status} = 'active' THEN ${subscriptions.id} END) AS INTEGER)`,
          totalSubscriptions: sql<number>`CAST(COUNT(DISTINCT ${subscriptions.id}) AS INTEGER)`,
          annualSpend: sql<string>`COALESCE(SUM(CASE WHEN ${subscriptions.status} = 'active' THEN
            CASE ${subscriptions.billingCycle}
              WHEN 'monthly' THEN ${subscriptions.totalCost} * 12
              WHEN 'quarterly' THEN ${subscriptions.totalCost} * 4
              WHEN 'annually' THEN ${subscriptions.totalCost}
              ELSE 0
            END
          END), 0)`,
        })
        .from(vendors)
        .leftJoin(subscriptions, eq(subscriptions.vendorId, vendors.id))
        .where(and(...conditions))
        .groupBy(vendors.id)
        .orderBy(desc(vendors.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const [{ count }] = await ctx.db
        .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
        .from(vendors)
        .where(and(...conditions));

      return {
        vendors: vendorList,
        total: count,
      };
    }),

  /**
   * Get vendor details with subscriptions and contracts
   */
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: and(
          eq(vendors.id, input.id),
          eq(vendors.tenantId, ctx.tenantId)
        ),
      });

      if (!vendor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vendor not found",
        });
      }

      // Get subscriptions
      const vendorSubscriptions = await ctx.db.query.subscriptions.findMany({
        where: eq(subscriptions.vendorId, input.id),
        orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
      });

      // Get contracts
      const vendorContracts = await ctx.db.query.contracts.findMany({
        where: eq(contracts.vendorId, input.id),
        orderBy: (contracts, { desc }) => [desc(contracts.createdAt)],
      });

      // Calculate total spend
      const activeSubscriptions = vendorSubscriptions.filter(
        (s) => s.status === "active"
      );
      const annualSpend = activeSubscriptions.reduce((sum, sub) => {
        const cost = parseFloat(sub.totalCost);
        const multiplier =
          sub.billingCycle === "monthly"
            ? 12
            : sub.billingCycle === "quarterly"
            ? 4
            : 1;
        return sum + cost * multiplier;
      }, 0);

      return {
        vendor,
        subscriptions: vendorSubscriptions,
        contracts: vendorContracts,
        metrics: {
          activeSubscriptions: activeSubscriptions.length,
          totalSubscriptions: vendorSubscriptions.length,
          annualSpend: annualSpend.toFixed(2),
        },
      };
    }),

  /**
   * Create new vendor
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        legalName: z.string().optional(),
        website: z.string().url().optional(),
        industry: z.string().optional(),
        country: z.string().optional(),
        taxId: z.string().optional(),
        complianceTier: z
          .enum(["none", "basic", "customer_data", "regulated"])
          .default("none"),
        primaryContact: z
          .object({
            name: z.string(),
            email: z.string().email(),
            phone: z.string().optional(),
            role: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check for duplicate vendor name
      const existing = await ctx.db.query.vendors.findFirst({
        where: and(
          eq(vendors.tenantId, ctx.tenantId),
          ilike(vendors.name, input.name)
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Vendor "${input.name}" already exists`,
        });
      }

      const [vendor] = await ctx.db
        .insert(vendors)
        .values({
          tenantId: ctx.tenantId,
          name: input.name,
          legalName: input.legalName || input.name,
          website: input.website,
          industry: input.industry,
          country: input.country,
          taxId: input.taxId,
          complianceTier: input.complianceTier,
          primaryContact: input.primaryContact,
          status: "active",
        })
        .returning();

      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.VENDOR_CREATED,
        entityType: "vendor",
        entityId: vendor.id,
        description: `Created vendor "${vendor.name}"`,
        metadata: { vendorName: vendor.name },
      });

      return vendor;
    }),

  /**
   * Update vendor
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        legalName: z.string().optional(),
        website: z.string().url().optional(),
        industry: z.string().optional(),
        country: z.string().optional(),
        taxId: z.string().optional(),
        complianceTier: z
          .enum(["none", "basic", "customer_data", "regulated"])
          .optional(),
        performanceScore: z.number().min(0).max(5).optional(),
        internalNotes: z.string().optional(),
        status: z.enum(["active", "inactive", "blocked", "pending_review"]).optional(),
        primaryContact: z
          .object({
            name: z.string(),
            email: z.string().email(),
            phone: z.string().optional(),
            role: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, performanceScore, ...updates } = input;

      const vendor = await ctx.db.query.vendors.findFirst({
        where: and(eq(vendors.id, id), eq(vendors.tenantId, ctx.tenantId)),
      });

      if (!vendor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vendor not found",
        });
      }

      const [updated] = await ctx.db
        .update(vendors)
        .set({
          ...updates,
          performanceScore: performanceScore !== undefined ? performanceScore.toString() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, id))
        .returning();

      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.VENDOR_UPDATED,
        entityType: "vendor",
        entityId: id,
        description: `Updated vendor "${updated.name}"`,
        metadata: { changes: Object.keys(updates) },
      });

      return updated;
    }),

  /**
   * Add compliance document
   */
  addComplianceDoc: adminProcedure
    .input(
      z.object({
        vendorId: z.string().uuid(),
        docType: z.string(),
        docName: z.string(),
        docUrl: z.string().url(),
        expiresAt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.db.query.vendors.findFirst({
        where: and(
          eq(vendors.id, input.vendorId),
          eq(vendors.tenantId, ctx.tenantId)
        ),
      });

      if (!vendor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vendor not found",
        });
      }

      const currentDocs = (vendor.complianceDocs as Array<{
        type: string;
        name: string;
        url: string;
        expiresAt?: string;
      }>) || [];

      const newDoc = {
        type: input.docType,
        name: input.docName,
        url: input.docUrl,
        expiresAt: input.expiresAt,
        uploadedAt: new Date().toISOString(),
      };

      const [updated] = await ctx.db
        .update(vendors)
        .set({
          complianceDocs: [...currentDocs, newDoc],
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, input.vendorId))
        .returning();

      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.COMPLIANCE_DOC_UPLOADED,
        entityType: "vendor",
        entityId: input.vendorId,
        description: `Uploaded compliance doc "${input.docName}" for vendor`,
        metadata: { docType: input.docType, docName: input.docName },
      });

      return updated;
    }),

  /**
   * Get or create vendor by name (for auto-creation from requests)
   */
  getOrCreate: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Try to find existing vendor (case-insensitive)
      const existing = await ctx.db.query.vendors.findFirst({
        where: and(
          eq(vendors.tenantId, ctx.tenantId),
          ilike(vendors.name, input.name)
        ),
      });

      if (existing) {
        return existing;
      }

      // Create new vendor with pending status
      const [vendor] = await ctx.db
        .insert(vendors)
        .values({
          tenantId: ctx.tenantId,
          name: input.name,
          legalName: input.name,
          status: "pending_review",
          complianceTier: "none",
        })
        .returning();

      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.VENDOR_AUTO_CREATED,
        entityType: "vendor",
        entityId: vendor.id,
        description: `Auto-created vendor "${vendor.name}" from request`,
        metadata: { vendorName: vendor.name, source: "request" },
      });

      return vendor;
    }),
});
