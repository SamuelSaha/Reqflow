import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";
import { users } from "./users";

/**
 * API Keys table
 * Used for CLI / programmatic access — an alternative to cookie-based sessions.
 * The raw key is shown once at creation and never stored.
 * Only the SHA-256 hash is persisted.
 */
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Human-readable label (e.g. "My laptop", "CI pipeline")
    name: text("name").notNull(),

    // First 8 chars after the "rqf_" prefix — shown in the UI so users can
    // identify a key without storing the full secret.
    keyPrefix: text("key_prefix").notNull(),

    // SHA-256 hex digest of the full key
    keyHash: text("key_hash").notNull().unique(),

    // Optional expiry — null means never expires
    expiresAt: timestamp("expires_at"),

    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("api_keys_tenant_idx").on(table.tenantId),
    index("api_keys_user_idx").on(table.userId),
    index("api_keys_hash_idx").on(table.keyHash),
  ]
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  organization: one(organizations, {
    fields: [apiKeys.tenantId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
