/**
 * tRPC Team Management Router
 * Handles user, department, and invite management for admins
 */

import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { users, departments, invites, organizations } from "@/lib/db/schema";
import { eq, and, or, desc, count as drizzleCount } from "drizzle-orm";
import { sendEmail, EmailTemplate } from "@/lib/queue/queues/email";

export const teamRouter = router({
  /**
   * List all users in the organization
   */
  listUsers: adminProcedure
    .input(
      z.object({
        role: z.enum(["requester", "manager", "finance", "admin"]).optional(),
        departmentId: z.string().uuid().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(users.tenantId, ctx.tenantId)];

      if (input.role) {
        conditions.push(eq(users.role, input.role));
      }

      if (input.departmentId) {
        conditions.push(eq(users.departmentId, input.departmentId));
      }

      if (input.isActive !== undefined) {
        conditions.push(eq(users.isActive, input.isActive));
      }

      const where = conditions.length > 1 ? and(...conditions) : conditions[0];

      const usersList = await ctx.db.query.users.findMany({
        where,
        with: {
          department: true,
        },
        orderBy: [desc(users.createdAt)],
      });

      return usersList.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        department: user.department
          ? {
              id: user.department.id,
              name: user.department.name,
              code: user.department.code,
            }
          : null,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      }));
    }),

  /**
   * Invite users to the organization
   */
  inviteUsers: adminProcedure
    .input(
      z.object({
        invites: z.array(
          z.object({
            email: z.string().email(),
            role: z.enum(["requester", "manager", "finance", "admin"]),
            departmentId: z.string().uuid().optional(),
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
        // Check if user already exists with this email
        const existingUser = await ctx.db.query.users.findFirst({
          where: and(
            eq(users.tenantId, ctx.tenantId),
            eq(users.email, inv.email.toLowerCase())
          ),
        });

        if (existingUser) {
          results.push({
            email: inv.email,
            sent: false,
            error: "User already exists",
          });
          continue;
        }

        // Check for pending invite
        const existingInvite = await ctx.db.query.invites.findFirst({
          where: and(
            eq(invites.tenantId, ctx.tenantId),
            eq(invites.email, inv.email.toLowerCase()),
            eq(invites.status, "pending")
          ),
        });

        if (existingInvite) {
          results.push({
            email: inv.email,
            sent: false,
            error: "Invite already pending",
          });
          continue;
        }

        // Create invite
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

        await ctx.db.insert(invites).values({
          tenantId: ctx.tenantId,
          email: inv.email.toLowerCase(),
          role: inv.role,
          invitedBy: ctx.user.id,
          token,
          status: "pending",
          expiresAt,
        });

        // Queue invite email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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

      return { results };
    }),

  /**
   * Update user profile (role, department, status)
   */
  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(["requester", "manager", "finance", "admin"]).optional(),
        departmentId: z.string().uuid().nullable().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent admin from deactivating themselves
      if (input.userId === ctx.user.id && input.isActive === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot deactivate your own account",
        });
      }

      // If changing role or deactivating, check if this is the last admin
      if (
        (input.role && input.role !== "admin") ||
        input.isActive === false
      ) {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, input.userId),
        });

        if (user?.role === "admin") {
          const [{ value: adminCount }] = await ctx.db
            .select({ value: drizzleCount() })
            .from(users)
            .where(
              and(
                eq(users.tenantId, ctx.tenantId),
                eq(users.role, "admin"),
                eq(users.isActive, true)
              )
            );

          if (Number(adminCount) <= 1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot remove or deactivate the last admin",
            });
          }
        }
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.role) updateData.role = input.role;
      if (input.departmentId !== undefined)
        updateData.departmentId = input.departmentId;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      const [updatedUser] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, input.userId))
        .returning();

      if (!updatedUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { success: true, user: updatedUser };
    }),
});
