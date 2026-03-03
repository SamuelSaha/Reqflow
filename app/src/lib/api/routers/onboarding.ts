/**
 * tRPC Onboarding Router
 * Handles the 5-step onboarding wizard
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  organizations,
  departments,
  budgets,
  invites,
  requests,
} from "@/lib/db/schema";
import { eq, count as drizzleCount } from "drizzle-orm";
import { refreshSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import type { Database } from "@/lib/db";

/**
 * PostgreSQL error with constraint violation details
 */
interface PostgresError extends Error {
  code?: string;
  constraint?: string;
}

/**
 * Generate cryptographically secure invite token
 * Uses 32 bytes (256 bits) of entropy, base64url encoded
 * Provides ~10^77 possible tokens (collision/brute-force resistant)
 */
function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  // Convert to base64url (URL-safe, no padding)
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Create invite with token collision retry
 * Handles unique constraint violations (astronomically unlikely with 256-bit tokens)
 * Defense-in-depth: retries up to 3 times on collision
 */
async function createInviteWithRetry(
  db: Database,
  data: {
    tenantId: string;
    email: string;
    role: string;
    invitedBy: string;
    status: string;
    expiresAt: Date;
  },
  maxAttempts = 3
): Promise<string> {
  let lastError: PostgresError = new Error("Failed to create invite") as PostgresError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const token = generateSecureToken();

    try {
      await db.insert(invites).values({
        ...data,
        token,
      });
      return token; // Success!
    } catch (err) {
      const pgError = err as PostgresError;
      lastError = pgError;

      // Check for unique constraint violation (PostgreSQL error code 23505)
      if (pgError.code === "23505" && pgError.constraint?.includes("token")) {
        // Token collision - retry with new token
        continue;
      }

      // Other error - rethrow immediately
      throw err;
    }
  }

  // Exhausted retries (astronomically unlikely)
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to generate unique invite token after multiple attempts",
    cause: lastError,
  });
}

export const onboardingRouter = router({
  /** Get current onboarding state */
  getState: protectedProcedure.query(async ({ ctx }) => {
    const org = await ctx.db.query.organizations.findFirst({
      where: eq(organizations.id, ctx.tenantId),
    });

    if (!org) throw new TRPCError({ code: "NOT_FOUND" });

    return {
      step: org.onboardingStep,
      completed: org.onboardingCompleted,
      orgName: org.name,
      orgIndustry: org.industry,
      orgSize: org.size,
      orgDomain: org.domain,
    };
  }),

  /** Step 1: Update company profile */
  updateCompanyProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        industry: z.string().optional(),
        size: z.string().optional(),
        domain: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug =
        input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 48) +
        "-" +
        Date.now().toString(36);

      await ctx.db
        .update(organizations)
        .set({
          name: input.name,
          slug,
          industry: input.industry,
          size: input.size,
          domain: input.domain,
          onboardingStep: 1,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, ctx.tenantId));

      return { success: true };
    }),

  /** Step 2a: Import budgets from CSV data */
  importBudgets: protectedProcedure
    .input(
      z.object({
        budgets: z.array(
          z.object({
            name: z.string().min(1),
            type: z.enum(["company", "department", "category", "project"]),
            category: z
              .enum(["saas", "services", "office", "travel", "hardware", "other"])
              .optional(),
            allocated: z.string(),
            period: z.enum(["monthly", "quarterly", "annually"]),
            startDate: z.string(),
            endDate: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const rows = input.budgets.map((b) => ({
        tenantId: ctx.tenantId,
        name: b.name,
        type: b.type,
        category: b.category,
        allocated: b.allocated,
        period: b.period,
        startDate: b.startDate,
        endDate: b.endDate,
      }));

      await ctx.db.insert(budgets).values(rows);

      await ctx.db
        .update(organizations)
        .set({ onboardingStep: 2, updatedAt: new Date() })
        .where(eq(organizations.id, ctx.tenantId));

      return { imported: rows.length };
    }),

  /** Step 2b: Create a single manual budget */
  createManualBudget: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        allocated: z.string(),
        period: z.enum(["monthly", "quarterly", "annually"]),
        category: z
          .enum(["saas", "services", "office", "travel", "hardware", "other"])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const endDate = new Date(now);
      if (input.period === "monthly") endDate.setMonth(endDate.getMonth() + 1);
      else if (input.period === "quarterly") endDate.setMonth(endDate.getMonth() + 3);
      else endDate.setFullYear(endDate.getFullYear() + 1);

      await ctx.db.insert(budgets).values({
        tenantId: ctx.tenantId,
        name: input.name,
        type: "company",
        category: input.category,
        allocated: input.allocated,
        period: input.period,
        startDate: now.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      await ctx.db
        .update(organizations)
        .set({ onboardingStep: 2, updatedAt: new Date() })
        .where(eq(organizations.id, ctx.tenantId));

      return { success: true };
    }),

  /** Step 3: Send team invites */
  sendInvites: protectedProcedure
    .input(
      z.object({
        invites: z.array(
          z.object({
            email: z.string().email(),
            role: z.enum(["requester", "manager", "finance", "admin"]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.id, ctx.tenantId),
      });

      const results = [];

      for (const inv of input.invites) {
        // Create invite with collision retry
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

        const token = await createInviteWithRetry(ctx.db, {
          tenantId: ctx.tenantId,
          email: inv.email.toLowerCase(),
          role: inv.role,
          invitedBy: ctx.user.id,
          status: "pending",
          expiresAt,
        });

        // Queue invite email
        const { sendEmail, EmailTemplate } = await import("@/lib/queue/queues/email");
        const baseUrl = env.NEXT_PUBLIC_APP_URL;
        await sendEmail({
          to: inv.email,
          subject: `${ctx.user.name} invited you to join ${org?.name || "Reqflow"}`,
          template: EmailTemplate.TEAM_INVITE,
          data: {
            inviterName: ctx.user.name,
            orgName: org?.name || "your team",
            inviteUrl: `${baseUrl}/signup?invite=${token}`,
            role: inv.role,
          },
        });

        results.push({ email: inv.email, sent: true });
      }

      await ctx.db
        .update(organizations)
        .set({ onboardingStep: 3, updatedAt: new Date() })
        .where(eq(organizations.id, ctx.tenantId));

      return { sent: results };
    }),

  /** Step 4: Create first request (simplified) */
  createFirstRequest: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        vendorName: z.string().optional(),
        amount: z.string(),
        category: z.enum(["saas", "services", "office", "travel", "hardware", "other"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;

      // Get user's department (fallback to first department in org)
      let departmentId = user.departmentId;
      if (!departmentId) {
        const dept = await ctx.db.query.departments.findFirst({
          where: eq(departments.tenantId, ctx.tenantId),
        });
        departmentId = dept?.id ?? null;
      }

      if (!departmentId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No department found" });
      }

      // Generate request number
      const [{ value: existingCount }] = await ctx.db
        .select({ value: drizzleCount() })
        .from(requests)
        .where(eq(requests.tenantId, ctx.tenantId));
      const requestNumber = `REQ-${new Date().getFullYear()}-${String(Number(existingCount) + 1).padStart(4, "0")}`;

      const [request] = await ctx.db
        .insert(requests)
        .values({
          requestNumber,
          tenantId: ctx.tenantId,
          requesterId: user.id,
          departmentId,
          title: input.title,
          vendorName: input.vendorName,
          amount: input.amount,
          category: input.category,
          frequency: "annually",
          status: "draft",
        })
        .returning();

      await ctx.db
        .update(organizations)
        .set({ onboardingStep: 4, updatedAt: new Date() })
        .where(eq(organizations.id, ctx.tenantId));

      return { requestId: request.id };
    }),

  /** Skip any step */
  skipStep: protectedProcedure
    .input(z.object({ step: z.number().min(0).max(4) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(organizations)
        .set({ onboardingStep: input.step + 1, updatedAt: new Date() })
        .where(eq(organizations.id, ctx.tenantId));

      return { success: true };
    }),

  /** Complete onboarding - flip flag and refresh JWT */
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(organizations)
      .set({
        onboardingCompleted: true,
        onboardingStep: 5,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, ctx.tenantId));

    // Refresh JWT so middleware sees onboardingCompleted: true
    await refreshSession(ctx.user.id);

    return { success: true };
  }),
});
