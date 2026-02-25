import { pgTable, uuid, text, timestamp, jsonb, index, date, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "./organizations";
import { contracts } from "./contracts";
import { subscriptions } from "./subscriptions";

export const renewalEvents = pgTable("renewal_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),

  // Key dates
  renewalDate: date("renewal_date").notNull(),
  noticeDeadline: date("notice_deadline").notNull(), // THE deadline to act

  // Status
  status: text("status").notNull().default("upcoming"), // upcoming, in_review, decided, auto_renewed, missed

  // Decision
  decision: text("decision"), // keep, downgrade, cancel, replace, renegotiate
  decisionDate: timestamp("decision_date"),
  decisionById: uuid("decision_by_id"),
  decisionNotes: text("decision_notes"),

  // Renewal readiness score (computed, stored for quick access)
  readinessScore: jsonb("readiness_score").$type<{
    usageReviewed: boolean;
    alternativesCompared: boolean;
    termsKnown: boolean;
    ownerActive: boolean;
    score: number; // 0-100
  }>(),

  // Checkpoints sent
  checkpoints: jsonb("checkpoints").$type<Array<{
    daysBeforeRenewal: number;
    sentAt: string;
    respondedAt?: string;
    respondedById?: string;
  }>>(),

  // Outcome
  newContractId: uuid("new_contract_id"), // If renewed, links to new contract
  savingsAmount: text("savings_amount"), // If renegotiated, savings captured

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("renewal_events_tenant_idx").on(table.tenantId),
  index("renewal_events_contract_idx").on(table.contractId),
  index("renewal_events_status_idx").on(table.status),
  index("renewal_events_renewal_date_idx").on(table.renewalDate),
  index("renewal_events_notice_deadline_idx").on(table.noticeDeadline),
]);

export const renewalEventRelations = relations(renewalEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [renewalEvents.tenantId],
    references: [organizations.id],
  }),
  contract: one(contracts, {
    fields: [renewalEvents.contractId],
    references: [contracts.id],
  }),
  subscription: one(subscriptions, {
    fields: [renewalEvents.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const insertRenewalEventSchema = createInsertSchema(renewalEvents);
export const selectRenewalEventSchema = createSelectSchema(renewalEvents);
export type InsertRenewalEvent = z.infer<typeof insertRenewalEventSchema>;
export type SelectRenewalEvent = typeof renewalEvents.$inferSelect;
