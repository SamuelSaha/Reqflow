/**
 * tRPC Team Management Router
 * Handles user, department, and invite management for admins
 */

import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../trpc";
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

  /**
   * List all departments with member counts
   */
  listDepartments: adminProcedure.query(async ({ ctx }) => {
    const deptList = await ctx.db.query.departments.findMany({
      where: eq(departments.tenantId, ctx.tenantId),
      with: {
        head: true,
      },
      orderBy: [desc(departments.createdAt)],
    });

    // Get member counts for each department
    const deptsWithCounts = await Promise.all(
      deptList.map(async (dept) => {
        const [{ value: memberCount }] = await ctx.db
          .select({ value: drizzleCount() })
          .from(users)
          .where(eq(users.departmentId, dept.id));

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          head: dept.head
            ? {
                id: dept.head.id,
                name: dept.head.name,
                email: dept.head.email,
              }
            : null,
          memberCount: Number(memberCount),
          createdAt: dept.createdAt,
        };
      })
    );

    return deptsWithCounts;
  }),

  /**
   * Create a new department
   */
  createDepartment: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        code: z.string().min(1).max(20).optional(),
        description: z.string().optional(),
        headId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate headId is a manager if provided
      if (input.headId) {
        const head = await ctx.db.query.users.findFirst({
          where: and(
            eq(users.id, input.headId),
            eq(users.tenantId, ctx.tenantId)
          ),
        });

        if (!head) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Department head not found",
          });
        }

        if (head.role !== "manager" && head.role !== "admin") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Department head must have manager or admin role",
          });
        }
      }

      const [dept] = await ctx.db
        .insert(departments)
        .values({
          tenantId: ctx.tenantId,
          name: input.name,
          code: input.code,
          description: input.description,
          headId: input.headId,
        })
        .returning();

      return { success: true, department: dept };
    }),

  /**
   * Update department
   */
  updateDepartment: adminProcedure
    .input(
      z.object({
        departmentId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        code: z.string().min(1).max(20).optional(),
        description: z.string().optional(),
        headId: z.string().uuid().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate headId is a manager if provided
      if (input.headId) {
        const head = await ctx.db.query.users.findFirst({
          where: and(
            eq(users.id, input.headId),
            eq(users.tenantId, ctx.tenantId)
          ),
        });

        if (!head) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Department head not found",
          });
        }

        if (head.role !== "manager" && head.role !== "admin") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Department head must have manager or admin role",
          });
        }
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.name) updateData.name = input.name;
      if (input.code !== undefined) updateData.code = input.code;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.headId !== undefined) updateData.headId = input.headId;

      const [updated] = await ctx.db
        .update(departments)
        .set(updateData)
        .where(eq(departments.id, input.departmentId))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Department not found",
        });
      }

      return { success: true, department: updated };
    }),

  /**
   * Delete department (validate no users or budgets)
   */
  deleteDepartment: adminProcedure
    .input(z.object({ departmentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check for users in this department
      const [{ value: userCount }] = await ctx.db
        .select({ value: drizzleCount() })
        .from(users)
        .where(eq(users.departmentId, input.departmentId));

      if (Number(userCount) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete department with ${userCount} member(s). Reassign users first.`,
        });
      }

      // Note: Budget validation would go here if budgets reference departments
      // For now, we'll proceed with deletion

      const [deleted] = await ctx.db
        .delete(departments)
        .where(eq(departments.id, input.departmentId))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Department not found",
        });
      }

      return { success: true };
    }),

  /**
   * List all invites with inviter information
   */
  listInvites: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "accepted", "expired"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(invites.tenantId, ctx.tenantId)];

      if (input.status) {
        conditions.push(eq(invites.status, input.status));
      }

      const where = conditions.length > 1 ? and(...conditions) : conditions[0];

      // Use manual join to avoid relation issues
      const inviteList = await ctx.db
        .select({
          id: invites.id,
          email: invites.email,
          role: invites.role,
          status: invites.status,
          expiresAt: invites.expiresAt,
          createdAt: invites.createdAt,
          inviter: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(invites)
        .leftJoin(users, eq(invites.invitedBy, users.id))
        .where(where)
        .orderBy(desc(invites.createdAt));

      return inviteList.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        invitedBy: invite.inviter.id
          ? {
              id: invite.inviter.id,
              name: invite.inviter.name,
              email: invite.inviter.email,
            }
          : { id: "", name: "Unknown", email: "" },
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
      }));
    }),

  /**
   * Resend invite (regenerate token and email)
   */
  resendInvite: adminProcedure
    .input(z.object({ inviteId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.query.invites.findFirst({
        where: and(
          eq(invites.id, input.inviteId),
          eq(invites.tenantId, ctx.tenantId)
        ),
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      if (invite.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot resend ${invite.status} invite`,
        });
      }

      // Generate new token and extend expiry
      const newToken = crypto.randomUUID();
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      await ctx.db
        .update(invites)
        .set({ token: newToken, expiresAt: newExpiresAt })
        .where(eq(invites.id, input.inviteId));

      // Get org for email
      const org = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.id, ctx.tenantId),
      });

      // Resend email
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await sendEmail({
        to: invite.email,
        subject: `${ctx.user.name} invited you to join ${org?.name || "Reqflow"}`,
        template: EmailTemplate.TEAM_INVITE,
        data: {
          inviterName: ctx.user.name,
          orgName: org?.name || "your team",
          inviteUrl: `${baseUrl}/signup?invite=${newToken}`,
          role: invite.role,
        },
      });

      return { success: true };
    }),

  /**
   * Revoke invite (set status to expired)
   */
  revokeInvite: adminProcedure
    .input(z.object({ inviteId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(invites)
        .set({ status: "expired" })
        .where(
          and(
            eq(invites.id, input.inviteId),
            eq(invites.tenantId, ctx.tenantId)
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      return { success: true };
    }),
});
