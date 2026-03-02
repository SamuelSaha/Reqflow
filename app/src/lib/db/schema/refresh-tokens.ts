import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

/**
 * Refresh Tokens
 * 🔒 SECURITY (issue #126): Long-lived tokens for session refresh
 * - Access tokens are short-lived (24h)
 * - Refresh tokens are long-lived (30d) and stored in DB
 * - Enables instant revocation (logout, security events)
 * - Rotation: each refresh generates new access+refresh pair
 */
export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Token value (random, unpredictable)
    token: text("token").notNull().unique(),

    // Metadata for security monitoring
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),

    // Expiration
    expiresAt: timestamp("expires_at").notNull(),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at").notNull().defaultNow(),
  },
  (table) => [
    // Index for token lookup
    index("refresh_tokens_token_idx").on(table.token),
    // Index for user cleanup (revoke all user tokens)
    index("refresh_tokens_user_idx").on(table.userId),
    // Index for expiration cleanup job
    index("refresh_tokens_expires_idx").on(table.expiresAt),
  ]
);

// Relations
export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
