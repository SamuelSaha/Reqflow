/**
 * OAuth State Tokens Schema
 * Stores CSRF protection tokens for OAuth flows with expiry
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const oauthStates = pgTable("oauth_states", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  userId: uuid("user_id").notNull(),
  provider: text("provider").notNull(), // 'quickbooks' | 'xero'
  state: text("state").notNull().unique(), // 32-byte random token
  expiresAt: timestamp("expires_at").notNull(), // 10 minutes from creation
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type OAuthState = typeof oauthStates.$inferSelect;
export type NewOAuthState = typeof oauthStates.$inferInsert;
