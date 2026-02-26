import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  index,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { departments } from "./departments";
import { z } from "zod";

/**
 * Budgets table
 * Hierarchical: Company → Department → Category/Project
 */
export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Budget hierarchy
    name: text("name").notNull(), // e.g., "Q1 2026 Engineering SaaS Budget"
    type: text("type").notNull(), // "company", "department", "category", "project"
    parentId: uuid("parent_id"), // Self-reference added after table definition

    // Scope
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    category: text("category"), // saas, services, office, travel, hardware, other

    // Budget amounts (in cents to avoid floating point issues)
    allocated: numeric("allocated", { precision: 12, scale: 2 }).notNull(), // Total allocated
    committed: numeric("committed", { precision: 12, scale: 2 }).notNull().default("0"), // Approved requests
    spent: numeric("spent", { precision: 12, scale: 2 }).notNull().default("0"), // Paid invoices
    // Remaining = allocated - committed - spent (calculated)

    // Period
    period: text("period").notNull(), // "monthly", "quarterly", "annually"
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),

    // Enforcement
    softLimit: numeric("soft_limit", { precision: 3, scale: 2 }).default("0.80"), // Alert at 80%
    hardLimit: numeric("hard_limit", { precision: 3, scale: 2 }).default("1.00"), // Block at 100%

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("budgets_tenant_idx").on(table.tenantId),
    index("budgets_department_idx").on(table.departmentId),
    index("budgets_period_idx").on(table.startDate, table.endDate),
  ]
);

// Relations
export const budgetsRelations = relations(budgets, ({ one }) => ({
  organization: one(organizations, {
    fields: [budgets.tenantId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [budgets.departmentId],
    references: [departments.id],
  }),
}));

// Zod schemas with input validation
export const insertBudgetSchema = createInsertSchema(budgets, {
  // Text field length limits (prevent DoS via large inputs)
  name: z.string().min(1).max(200),

  // Enum validations
  type: z.enum(["company", "department", "category", "project"]),
  period: z.enum(["monthly", "quarterly", "annually"]),
  category: z
    .enum(["saas", "services", "office", "travel", "hardware", "other"])
    .optional(),
});

export const selectBudgetSchema = createSelectSchema(budgets);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
