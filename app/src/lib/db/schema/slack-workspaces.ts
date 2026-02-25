import { pgTable, text, timestamp, uuid, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";

/**
 * Slack Workspaces table
 * Stores Slack workspace connections and bot tokens per tenant
 */
export const slackWorkspaces = pgTable(
  "slack_workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Slack workspace info
    slackTeamId: text("slack_team_id").notNull().unique(),
    slackTeamName: text("slack_team_name").notNull(),

    // Bot token (should be encrypted at rest)
    botToken: text("bot_token").notNull(),
    botUserId: text("bot_user_id").notNull(),

    // Status
    isActive: boolean("is_active").notNull().default(true),

    // Timestamps
    installedAt: timestamp("installed_at").notNull().defaultNow(),
  },
  (table) => [
    index("slack_workspaces_tenant_idx").on(table.tenantId),
    index("slack_workspaces_team_idx").on(table.slackTeamId),
  ]
);

// Relations
export const slackWorkspacesRelations = relations(slackWorkspaces, ({ one }) => ({
  organization: one(organizations, {
    fields: [slackWorkspaces.tenantId],
    references: [organizations.id],
  }),
}));

// Zod schemas
export const insertSlackWorkspaceSchema = createInsertSchema(slackWorkspaces);
export const selectSlackWorkspaceSchema = createSelectSchema(slackWorkspaces);

export type SlackWorkspace = typeof slackWorkspaces.$inferSelect;
export type NewSlackWorkspace = typeof slackWorkspaces.$inferInsert;
