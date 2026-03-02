import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { users } from "./users";
import { z } from "zod";

/**
 * Invites table
 * Token-based team invitations sent during onboarding or later
 */
export const invites = pgTable(
  "invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    email: text("email").notNull(),
    role: text("role").notNull().default("requester"), // requester, manager, finance, admin
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Token for accepting
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"), // pending, accepted, expired

    // Expiry
    expiresAt: timestamp("expires_at").notNull(),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("invites_tenant_idx").on(table.tenantId),
    index("invites_token_idx").on(table.token),
    index("invites_email_idx").on(table.email),
    // Composite: duplicate invite check (tenant + email + status)
    index("invites_tenant_email_status_idx").on(table.tenantId, table.email, table.status),
  ]
);

// Relations
export const invitesRelations = relations(invites, ({ one }) => ({
  organization: one(organizations, {
    fields: [invites.tenantId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invites.invitedBy],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertInviteSchema = createInsertSchema(invites, {
  email: z.string().email(),
  role: z.enum(["requester", "manager", "finance", "admin"]),
  status: z.enum(["pending", "accepted", "expired"]),
});

export const selectInviteSchema = createSelectSchema(invites);

export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
