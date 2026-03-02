import { pgTable, text, timestamp, uuid, boolean, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";


/**
 * Organizations table - the tenant entity
 * Each organization is a completely isolated tenant
 */
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  // Settings
  domain: text("domain"), // For auto-joining by email domain
  industry: text("industry"),
  size: text("size"), // e.g., "50-100", "100-250", etc.

  // Subscription
  plan: text("plan").notNull().default("starter"), // starter, growth, scale
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),

  // Status
  isActive: boolean("is_active").notNull().default(true),

  // Onboarding
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  onboardingStep: integer("onboarding_step").notNull().default(0), // 0-4

  // AI - Bring Your Own API Key (multi-provider, Issue #35)
  // Encrypted with FIELD_ENCRYPTION_KEY (AES-256-GCM) — never returned to client
  anthropicApiKey: text("anthropic_api_key"), // legacy; kept for backward compat
  aiProvider: text("ai_provider").default("anthropic"), // 'anthropic' | 'openai' | 'gemini'
  aiApiKey: text("ai_api_key"), // encrypted key for the active provider

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
},
(table) => [
  // Index for email-domain auto-join lookup on signup
  index("organizations_domain_idx").on(table.domain),
  index("organizations_plan_idx").on(table.plan),
]);

// Zod schemas for validation
export const insertOrganizationSchema = createInsertSchema(organizations);
export const selectOrganizationSchema = createSelectSchema(organizations);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
