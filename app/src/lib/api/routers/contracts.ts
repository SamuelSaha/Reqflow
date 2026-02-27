/**
 * tRPC Contracts Router
 * CRUD operations for contract management with notice deadline tracking
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { contracts } from "@/lib/db/schema";
import { eq, and, desc, gte, lte, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createAuditLog, AuditAction } from "@/lib/monitoring/audit";

export const contractsRouter = router({
  /**
   * List all contracts with filtering and sorting
   * Includes vendor details and deadline alerts
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "active", "expired", "cancelled", "renewed"]).optional(),
        vendorId: z.string().uuid().optional(),
        showUpcomingDeadlines: z.boolean().optional(), // Filter to notice deadlines in next 90 days
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(contracts.tenantId, ctx.tenantId)];

      // Status filter
      if (input.status) {
        conditions.push(eq(contracts.status, input.status));
      }

      // Vendor filter
      if (input.vendorId) {
        conditions.push(eq(contracts.vendorId, input.vendorId));
      }

      // Upcoming deadlines filter (notice deadline in next 90 days)
      if (input.showUpcomingDeadlines) {
        const today = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(today.getDate() + 90);

        conditions.push(
          and(
            gte(contracts.noticeDeadline, today.toISOString().split("T")[0]),
            lte(contracts.noticeDeadline, ninetyDaysFromNow.toISOString().split("T")[0])
          )!
        );
      }

      const contractList = await ctx.db.query.contracts.findMany({
        where: and(...conditions),
        orderBy: [desc(contracts.noticeDeadline), desc(contracts.createdAt)],
        with: {
          vendor: {
            columns: {
              id: true,
              name: true,
              website: true,
            },
          },
        },
      });

      return contractList;
    }),

  /**
   * Get contracts approaching notice deadlines
   * For dashboard alerts and notifications
   */
  upcomingDeadlines: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcomingContracts = await ctx.db.query.contracts.findMany({
      where: and(
        eq(contracts.tenantId, ctx.tenantId),
        eq(contracts.status, "active"),
        gte(contracts.noticeDeadline, today.toISOString().split("T")[0]),
        lte(contracts.noticeDeadline, thirtyDaysFromNow.toISOString().split("T")[0])
      ),
      orderBy: [contracts.noticeDeadline],
      with: {
        vendor: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return upcomingContracts;
  }),

  /**
   * Get a single contract by ID
   * Includes all related data
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: and(eq(contracts.id, input.id), eq(contracts.tenantId, ctx.tenantId)),
        with: {
          vendor: true,
        },
      });

      if (!contract) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      return contract;
    }),

  /**
   * Create a new contract
   * Auto-calculates notice deadline from renewal date and notice period
   */
  create: protectedProcedure
    .input(
      z.object({
        vendorId: z.string().uuid(),
        title: z.string().min(3, "Title must be at least 3 characters"),
        contractNumber: z.string().optional(),
        type: z.enum(["subscription", "service", "license", "framework"]).default("subscription"),
        status: z.enum(["draft", "active"]).default("draft"),
        startDate: z.string(), // YYYY-MM-DD
        endDate: z.string().optional(),
        autoRenew: z.boolean().default(false),
        renewalDate: z.string().optional(),
        noticePeriodDays: z.number().optional(),
        upliftCap: z.number().optional(),
        totalValue: z.string().optional(),
        currency: z.string().default("EUR"),
        paymentTerms: z.string().optional(),
        extractedTerms: z
          .object({
            terminationRights: z.string().optional(),
            dataRetention: z.string().optional(),
            liabilityCap: z.string().optional(),
            confidentiality: z.string().optional(),
            subprocessorChanges: z.string().optional(),
            slaDetails: z.string().optional(),
          })
          .optional(),
        ownerId: z.string().uuid().optional(),
        documentUrl: z.string().optional(),
        amendments: z
          .array(
            z.object({
              date: z.string(),
              description: z.string(),
              url: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Calculate notice deadline if renewal date and notice period are provided
      let noticeDeadline: string | undefined;
      if (input.renewalDate && input.noticePeriodDays) {
        const renewalDateObj = new Date(input.renewalDate);
        const deadlineDate = new Date(renewalDateObj);
        deadlineDate.setDate(deadlineDate.getDate() - input.noticePeriodDays);
        noticeDeadline = deadlineDate.toISOString().split("T")[0];
      }

      // Insert contract
      const [contract] = await ctx.db
        .insert(contracts)
        .values({
          tenantId: ctx.tenantId,
          vendorId: input.vendorId,
          title: input.title,
          contractNumber: input.contractNumber,
          type: input.type,
          status: input.status,
          startDate: input.startDate,
          endDate: input.endDate,
          autoRenew: input.autoRenew,
          renewalDate: input.renewalDate,
          noticeDeadline,
          noticePeriodDays: input.noticePeriodDays?.toString(),
          upliftCap: input.upliftCap?.toString(),
          totalValue: input.totalValue,
          currency: input.currency,
          paymentTerms: input.paymentTerms,
          extractedTerms: input.extractedTerms,
          ownerId: input.ownerId,
          documentUrl: input.documentUrl,
          amendments: input.amendments,
        })
        .returning();

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: "contract.created",
        entityType: "contract",
        entityId: contract.id,
        description: `Created contract: ${input.title}`,
        metadata: {
          vendorId: input.vendorId,
          status: input.status,
          noticeDeadline,
        },
      });

      return contract;
    }),

  /**
   * Update an existing contract
   * Recalculates notice deadline if renewal date or notice period changes
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(3).optional(),
        contractNumber: z.string().optional(),
        type: z.enum(["subscription", "service", "license", "framework"]).optional(),
        status: z.enum(["draft", "active", "expired", "cancelled", "renewed"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        autoRenew: z.boolean().optional(),
        renewalDate: z.string().optional(),
        noticePeriodDays: z.number().optional(),
        upliftCap: z.number().optional(),
        totalValue: z.string().optional(),
        currency: z.string().optional(),
        paymentTerms: z.string().optional(),
        extractedTerms: z
          .object({
            terminationRights: z.string().optional(),
            dataRetention: z.string().optional(),
            liabilityCap: z.string().optional(),
            confidentiality: z.string().optional(),
            subprocessorChanges: z.string().optional(),
            slaDetails: z.string().optional(),
          })
          .optional(),
        ownerId: z.string().uuid().optional(),
        documentUrl: z.string().optional(),
        amendments: z
          .array(
            z.object({
              date: z.string(),
              description: z.string(),
              url: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get existing contract
      const existing = await ctx.db.query.contracts.findFirst({
        where: and(eq(contracts.id, input.id), eq(contracts.tenantId, ctx.tenantId)),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      // Recalculate notice deadline if renewal date or notice period changed
      let noticeDeadline: string | null | undefined = existing.noticeDeadline;
      const newRenewalDate = input.renewalDate ?? existing.renewalDate;
      const newNoticePeriod = input.noticePeriodDays ?? (existing.noticePeriodDays ? parseFloat(existing.noticePeriodDays) : undefined);

      if (newRenewalDate && newNoticePeriod) {
        const renewalDateObj = new Date(newRenewalDate);
        const deadlineDate = new Date(renewalDateObj);
        deadlineDate.setDate(deadlineDate.getDate() - newNoticePeriod);
        noticeDeadline = deadlineDate.toISOString().split("T")[0];
      }

      // Update contract
      const [updated] = await ctx.db
        .update(contracts)
        .set({
          title: input.title ?? existing.title,
          contractNumber: input.contractNumber ?? existing.contractNumber,
          type: input.type ?? existing.type,
          status: input.status ?? existing.status,
          startDate: input.startDate ?? existing.startDate,
          endDate: input.endDate ?? existing.endDate,
          autoRenew: input.autoRenew ?? existing.autoRenew,
          renewalDate: input.renewalDate ?? existing.renewalDate,
          noticeDeadline,
          noticePeriodDays: input.noticePeriodDays?.toString() ?? existing.noticePeriodDays,
          upliftCap: input.upliftCap?.toString() ?? existing.upliftCap,
          totalValue: input.totalValue ?? existing.totalValue,
          currency: input.currency ?? existing.currency,
          paymentTerms: input.paymentTerms ?? existing.paymentTerms,
          extractedTerms: input.extractedTerms ?? existing.extractedTerms,
          ownerId: input.ownerId ?? existing.ownerId,
          documentUrl: input.documentUrl ?? existing.documentUrl,
          amendments: input.amendments ?? existing.amendments,
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, input.id))
        .returning();

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: "contract.updated",
        entityType: "contract",
        entityId: input.id,
        description: `Updated contract: ${updated.title}`,
        before: {
          status: existing.status,
          noticeDeadline: existing.noticeDeadline,
        },
        after: {
          status: updated.status,
          noticeDeadline: updated.noticeDeadline,
        },
      });

      return updated;
    }),

  /**
   * Delete a contract
   * Admin only - contracts should generally be marked as cancelled instead
   */
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.contracts.findFirst({
        where: and(eq(contracts.id, input.id), eq(contracts.tenantId, ctx.tenantId)),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      await ctx.db.delete(contracts).where(eq(contracts.id, input.id));

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: "contract.deleted",
        entityType: "contract",
        entityId: input.id,
        description: `Deleted contract: ${existing.title}`,
        metadata: {
          vendorId: existing.vendorId,
          status: existing.status,
        },
      });

      return { success: true };
    }),
});
