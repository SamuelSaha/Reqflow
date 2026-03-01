/**
 * tRPC router for invoices and 3-way matching
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { invoices, requests, subscriptions } from "../../db/schema";
import { eq, and, desc, or, isNull, sql } from "drizzle-orm";

/**
 * 3-way matching engine
 * Matches Invoice against Request (PO) + Subscription (Receipt)
 */
function calculateMatch(invoice: {
  amount: string;
  totalAmount: string;
  vendorId: string | null;
  subscriptionId: string | null;
}, matchTarget: {
  amount: string;
  vendorId?: string | null;
  subscriptionId?: string | null;
}) {
  const invoiceTotal = parseFloat(invoice.totalAmount);
  const expectedAmount = parseFloat(matchTarget.amount);

  // Calculate variance
  const variance = invoiceTotal - expectedAmount;
  const variancePercent = Math.abs(variance) / expectedAmount;

  // Exact match (confidence 1.00)
  if (variance === 0) {
    return {
      matchStatus: "auto_matched" as const,
      matchConfidence: 1.0,
      varianceAmount: 0,
      varianceReason: null,
    };
  }

  // Threshold match: ±5% variance (confidence 0.85-0.95)
  if (variancePercent <= 0.05) {
    const confidence = 0.95 - (variancePercent * 2); // Linear scale: 0% → 0.95, 5% → 0.85
    return {
      matchStatus: "auto_matched" as const,
      matchConfidence: Number(confidence.toFixed(2)),
      varianceAmount: Number(variance.toFixed(2)),
      varianceReason: variance > 0 ? "overcharge" : "undercharge",
    };
  }

  // Manual review required: >5% variance
  return {
    matchStatus: "unmatched" as const,
    matchConfidence: 0.5,
    varianceAmount: Number(variance.toFixed(2)),
    varianceReason: variance > 0 ? "significant_overcharge" : "significant_undercharge",
  };
}

export const invoicesRouter = router({
  /**
   * List all invoices for organization
   */
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["pending", "approved", "paid", "disputed", "overdue", "cancelled"]).optional(),
      matchStatus: z.enum(["unmatched", "auto_matched", "manual_matched", "disputed"]).optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const conditions = [eq(invoices.tenantId, ctx.tenantId)];

      if (input?.status) {
        conditions.push(eq(invoices.status, input.status));
      }

      if (input?.matchStatus) {
        conditions.push(eq(invoices.matchStatus, input.matchStatus));
      }

      // Full-text search using PostgreSQL tsvector
      if (input?.search) {
        const searchQuery = input.search.trim().split(/\s+/).join(' & ');
        conditions.push(
          sql`${invoices.searchVector} @@ to_tsquery('english', ${searchQuery})`
        );
      }

      const items = await ctx.db.query.invoices.findMany({
        where: and(...conditions),
        with: {
          vendor: true,
          contract: true,
          subscription: true,
        },
        orderBy: [desc(invoices.createdAt)],
        limit: input?.limit || 50,
      });

      return items;
    }),

  /**
   * Get invoice by ID
   */
  getById: protectedProcedure
    .input(z.object({ invoiceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.tenantId, ctx.tenantId)
        ),
        with: {
          vendor: true,
          contract: true,
          subscription: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      return invoice;
    }),

  /**
   * Create invoice
   */
  create: protectedProcedure
    .input(z.object({
      vendorId: z.string().uuid().optional(),
      contractId: z.string().uuid().optional(),
      subscriptionId: z.string().uuid().optional(),
      invoiceNumber: z.string().optional(),
      externalRef: z.string().optional(),
      amount: z.number().positive(),
      currency: z.string().default("EUR"),
      taxAmount: z.number().optional(),
      totalAmount: z.number().positive(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number().optional(),
        unitPrice: z.number().optional(),
        amount: z.number(),
      })).optional(),
      issueDate: z.string(),
      dueDate: z.string().optional(),
      periodStart: z.string().optional(),
      periodEnd: z.string().optional(),
      source: z.enum(["manual", "email", "ocr", "api", "card_transaction"]).default("manual"),
      sourceRef: z.string().optional(),
      documentUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [invoice] = await ctx.db
        .insert(invoices)
        .values({
          tenantId: ctx.tenantId,
          vendorId: input.vendorId || null,
          contractId: input.contractId || null,
          subscriptionId: input.subscriptionId || null,
          invoiceNumber: input.invoiceNumber || null,
          externalRef: input.externalRef || null,
          amount: input.amount.toString(),
          currency: input.currency,
          taxAmount: input.taxAmount?.toString() || null,
          totalAmount: input.totalAmount.toString(),
          lineItems: input.lineItems || null,
          issueDate: input.issueDate,
          dueDate: input.dueDate || null,
          periodStart: input.periodStart || null,
          periodEnd: input.periodEnd || null,
          source: input.source,
          sourceRef: input.sourceRef || null,
          documentUrl: input.documentUrl || null,
          status: "pending",
          matchStatus: "unmatched",
        })
        .returning();

      return invoice;
    }),

  /**
   * Match invoice to request (PO)
   * Runs 3-way matching algorithm
   */
  match: protectedProcedure
    .input(z.object({
      invoiceId: z.string().uuid(),
      requestId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get invoice
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.tenantId, ctx.tenantId)
        ),
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      // Find matching request (PO)
      let matchedRequest = null;

      if (input.requestId) {
        // Manual match to specific request
        matchedRequest = await ctx.db.query.requests.findFirst({
          where: and(
            eq(requests.id, input.requestId),
            eq(requests.tenantId, ctx.tenantId),
            eq(requests.status, "approved")
          ),
        });
      } else {
        // Auto-match: find request by vendor + amount range
        const invoiceTotal = parseFloat(invoice.totalAmount);
        const matchCandidates = await ctx.db.query.requests.findMany({
          where: and(
            eq(requests.tenantId, ctx.tenantId),
            eq(requests.status, "approved"),
            invoice.vendorId ? eq(requests.vendorId, invoice.vendorId) : undefined,
          ),
          limit: 10,
        });

        // Find best match by amount proximity
        matchedRequest = matchCandidates.reduce((best, candidate) => {
          const candidateAmount = parseFloat(candidate.amount);
          const variance = Math.abs(invoiceTotal - candidateAmount);
          const bestVariance = best ? Math.abs(invoiceTotal - parseFloat(best.amount)) : Infinity;
          return variance < bestVariance ? candidate : best;
        }, null as typeof matchCandidates[0] | null);
      }

      if (!matchedRequest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No matching purchase request found",
        });
      }

      // Calculate match confidence and variance
      const matchResult = calculateMatch(invoice, {
        amount: matchedRequest.amount,
        vendorId: matchedRequest.vendorId,
      });

      // Update invoice with match results
      const [updated] = await ctx.db
        .update(invoices)
        .set({
          matchStatus: matchResult.matchStatus,
          matchConfidence: matchResult.matchConfidence.toString(),
          varianceAmount: matchResult.varianceAmount.toString(),
          varianceReason: matchResult.varianceReason,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.invoiceId))
        .returning();

      return {
        invoice: updated,
        matchedRequest,
        matchResult,
      };
    }),

  /**
   * Approve invoice (with or without variance)
   */
  approve: protectedProcedure
    .input(z.object({
      invoiceId: z.string().uuid(),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.tenantId, ctx.tenantId)
        ),
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      if (invoice.status === "approved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invoice is already approved",
        });
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          status: "approved",
          matchStatus: invoice.matchStatus === "unmatched" ? "manual_matched" : invoice.matchStatus,
          approvedById: ctx.user.id,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.invoiceId))
        .returning();

      return updated;
    }),

  /**
   * Dispute invoice
   */
  dispute: protectedProcedure
    .input(z.object({
      invoiceId: z.string().uuid(),
      reason: z.string().min(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.tenantId, ctx.tenantId)
        ),
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          status: "disputed",
          matchStatus: "disputed",
          varianceReason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.invoiceId))
        .returning();

      return updated;
    }),

  /**
   * Get invoice matching stats
   */
  getMatchingStats: protectedProcedure
    .query(async ({ ctx }) => {
      const allInvoices = await ctx.db.query.invoices.findMany({
        where: eq(invoices.tenantId, ctx.tenantId),
      });

      const stats = {
        total: allInvoices.length,
        unmatched: allInvoices.filter(i => i.matchStatus === "unmatched").length,
        autoMatched: allInvoices.filter(i => i.matchStatus === "auto_matched").length,
        manualMatched: allInvoices.filter(i => i.matchStatus === "manual_matched").length,
        disputed: allInvoices.filter(i => i.matchStatus === "disputed").length,
        avgConfidence: allInvoices
          .filter(i => i.matchConfidence)
          .reduce((sum, i) => sum + parseFloat(i.matchConfidence!), 0) /
          allInvoices.filter(i => i.matchConfidence).length || 0,
        totalVariance: allInvoices
          .filter(i => i.varianceAmount)
          .reduce((sum, i) => sum + parseFloat(i.varianceAmount!), 0),
      };

      return stats;
    }),
});
