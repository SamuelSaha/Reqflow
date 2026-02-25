import { pgTable, text, timestamp, uuid, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { departments } from "./departments";
import { invites } from "./invites";
import { z } from "zod";

/**
 * Users table
 * Belongs to an organization (tenant)
 * Integrated with Better Auth
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Profile
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatar: text("avatar"),

    // Authentication
    passwordHash: text("password_hash"), // Bcrypt hash

    // Role-based access control
    role: text("role").notNull().default("requester"), // requester, manager, finance, admin

    // Department assignment
    departmentId: uuid("department_id"), // Will reference departments.id

    // Better Auth integration
    betterAuthId: text("better_auth_id").unique(),

    // Status
    isActive: boolean("is_active").notNull().default(true),
    emailVerified: boolean("email_verified").notNull().default(false),

    // MFA (Better Auth handles this, but we track the requirement)
    mfaEnabled: boolean("mfa_enabled").notNull().default(false),
    mfaRequired: boolean("mfa_required").notNull().default(false), // Finance + Admin roles

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at"),
  },
  (table) => [
    // Indexes for common queries
    index("users_tenant_idx").on(table.tenantId),
    index("users_email_idx").on(table.email),
    index("users_better_auth_idx").on(table.betterAuthId),
  ]
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.tenantId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  invites: many(invites),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  role: z.enum(["requester", "manager", "finance", "admin"]),
});

export const selectUserSchema = createSelectSchema(users);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
