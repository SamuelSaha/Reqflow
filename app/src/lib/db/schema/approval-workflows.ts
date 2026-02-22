import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { z } from "zod";

/**
 * Approval Workflows table
 * Configurable workflow templates that define approval chains
 */
export const approvalWorkflows = pgTable(
  "approval_workflows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Workflow metadata
    name: text("name").notNull(), // e.g., "Simple", "Department-specific", "High-value"
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),

    // Conditions that trigger this workflow
    conditions: jsonb("conditions")
      .notNull()
      .$type<{
        amountMin?: number;
        amountMax?: number;
        categories?: string[];
        departments?: string[];
        vendorTypes?: string[];
        customRules?: Array<{
          field: string;
          operator: string;
          value: unknown;
        }>;
      }>(),

    // Approval chain definition
    // This is where YOU will define the business logic!
    // Each step can have: role, specific user, department head, or custom logic
    approvalChain: jsonb("approval_chain")
      .notNull()
      .$type<
        Array<{
          step: number;
          type: "role" | "user" | "department_head" | "custom";
          value: string; // role name, user ID, or custom identifier
          required: "required" | "optional" | "parallel";
          condition?: {
            field: string;
            operator: string;
            value: unknown;
          };
        }>
      >(),

    // Escalation rules
    escalation: jsonb("escalation").$type<{
      enabled: boolean;
      reminderAfterHours?: number;
      escalateAfterHours?: number;
      escalateTo?: "manager" | "finance" | "admin";
    }>(),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("approval_workflows_tenant_idx").on(table.tenantId),
    index("approval_workflows_active_idx").on(table.isActive),
  ]
);

// Relations
export const approvalWorkflowsRelations = relations(approvalWorkflows, ({ one }) => ({
  organization: one(organizations, {
    fields: [approvalWorkflows.tenantId],
    references: [organizations.id],
  }),
}));

// Zod schemas
export const insertApprovalWorkflowSchema = createInsertSchema(approvalWorkflows);
export const selectApprovalWorkflowSchema = createSelectSchema(approvalWorkflows);

export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect;
export type NewApprovalWorkflow = typeof approvalWorkflows.$inferInsert;
