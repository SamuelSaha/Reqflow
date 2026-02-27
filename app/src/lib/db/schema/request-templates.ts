import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { users } from "./users";
import { z } from "zod";

/**
 * Request Templates table
 * Allows users to save and reuse common request patterns
 * Can be personal or shared across the organization
 */
export const requestTemplates = pgTable(
  "request_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Template metadata
    name: text("name").notNull(), // e.g., "Office Supplies - Standard Order"
    description: text("description"), // Optional description of what this template is for

    // Creator
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Template data (stores form field values as JSON)
    // Example: { title: "...", category: "office", vendorName: "...", amount: "50.00", ... }
    templateData: jsonb("template_data")
      .notNull()
      .$type<{
        title?: string;
        description?: string;
        category?: "saas" | "services" | "office" | "travel" | "hardware" | "other";
        vendorName?: string;
        amount?: string;
        frequency?: "one-time" | "monthly" | "annually";
        quantity?: number;
        urgency?: "low" | "normal" | "urgent";
        isTrial?: boolean;
        trialEndDate?: string;
        trialSuccessCriteria?: Array<{ metric: string; target: string }>;
        trialEstimatedAnnualCost?: string;
      }>(),

    // Visibility
    isPublic: boolean("is_public").notNull().default(false), // If true, visible to all users in org

    // Usage tracking
    useCount: integer("use_count").notNull().default(0), // Incremented each time template is used

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("request_templates_tenant_idx").on(table.tenantId),
    index("request_templates_creator_idx").on(table.createdById),
    index("request_templates_public_idx").on(table.isPublic),
    index("request_templates_use_count_idx").on(table.useCount), // For sorting by popularity
  ]
);

// Relations
export const requestTemplatesRelations = relations(requestTemplates, ({ one }) => ({
  organization: one(organizations, {
    fields: [requestTemplates.tenantId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [requestTemplates.createdById],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertRequestTemplateSchema = createInsertSchema(requestTemplates, {
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().optional(),
  templateData: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.enum(["saas", "services", "office", "travel", "hardware", "other"]).optional(),
    vendorName: z.string().optional(),
    amount: z.string().optional(),
    frequency: z.enum(["one-time", "monthly", "annually"]).optional(),
    quantity: z.number().optional(),
    urgency: z.enum(["low", "normal", "urgent"]).optional(),
    isTrial: z.boolean().optional(),
    trialEndDate: z.string().optional(),
    trialSuccessCriteria: z.array(z.object({ metric: z.string(), target: z.string() })).optional(),
    trialEstimatedAnnualCost: z.string().optional(),
  }),
  isPublic: z.boolean().default(false),
});

export const selectRequestTemplateSchema = createSelectSchema(requestTemplates);

export type RequestTemplate = typeof requestTemplates.$inferSelect;
export type NewRequestTemplate = typeof requestTemplates.$inferInsert;
export type RequestTemplateData = RequestTemplate["templateData"];
