import { pgTable, text, timestamp, uuid, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { users } from "./users";

/**
 * Slack User Mappings table
 * Maps Slack user IDs to Reqflow user accounts for request creation
 */
export const slackUserMappings = pgTable(
  "slack_user_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Slack user info
    slackUserId: text("slack_user_id").notNull(),
    slackEmail: text("slack_email").notNull(),

    // Reqflow user mapping
    reqflowUserId: uuid("reqflow_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Unique constraint: one Slack user per tenant
    unique("slack_user_mappings_tenant_slack_unique").on(
      table.tenantId,
      table.slackUserId
    ),
    index("slack_user_mappings_slack_id_idx").on(table.slackUserId),
    index("slack_user_mappings_tenant_idx").on(table.tenantId),
  ]
);

// Relations
export const slackUserMappingsRelations = relations(slackUserMappings, ({ one }) => ({
  organization: one(organizations, {
    fields: [slackUserMappings.tenantId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [slackUserMappings.reqflowUserId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertSlackUserMappingSchema = createInsertSchema(slackUserMappings);
export const selectSlackUserMappingSchema = createSelectSchema(slackUserMappings);

export type SlackUserMapping = typeof slackUserMappings.$inferSelect;
export type NewSlackUserMapping = typeof slackUserMappings.$inferInsert;
