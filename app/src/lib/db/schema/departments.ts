import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations";
import { users } from "./users";

/**
 * Departments table
 * Used for budget allocation and approval routing
 */
export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Department info
    name: text("name").notNull(), // e.g., "Engineering", "Marketing", "Sales"
    code: text("code"), // Optional short code: "ENG", "MKT"
    description: text("description"),

    // Department head
    headId: uuid("head_id").references(() => users.id, { onDelete: "set null" }),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("departments_tenant_idx").on(table.tenantId)]
);

// Relations
export const departmentsRelations = relations(departments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [departments.tenantId],
    references: [organizations.id],
  }),
  head: one(users, {
    fields: [departments.headId],
    references: [users.id],
  }),
  members: many(users),
}));

// Zod schemas
export const insertDepartmentSchema = createInsertSchema(departments);
export const selectDepartmentSchema = createSelectSchema(departments);

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
