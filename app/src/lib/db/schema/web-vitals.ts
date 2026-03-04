import { pgTable, text, timestamp, uuid, doublePrecision, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Web Vitals Metrics Table
 *
 * Stores Core Web Vitals performance metrics for monitoring and analysis.
 * Metrics collected: CLS, FCP, LCP, TTFB, INP
 *
 * Related to Issue #133: Establish Web Vitals baseline and monitoring
 */
export const webVitals = pgTable("web_vitals", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Metric details
  metricName: text("metric_name").notNull(), // "CLS" | "FCP" | "LCP" | "TTFB" | "INP"
  value: doublePrecision("value").notNull(), // Metric value in milliseconds (or unitless for CLS)
  rating: text("rating").notNull(), // "good" | "needs-improvement" | "poor"
  delta: doublePrecision("delta"), // Change since last measurement
  metricId: text("metric_id").notNull(), // Unique ID from web-vitals library

  // Navigation context
  navigationType: text("navigation_type"), // "navigate" | "reload" | "back-forward" | "prerender"

  // Page context
  url: text("url").notNull(), // Full URL where metric was captured
  page: text("page").notNull(), // Pathname only (e.g., "/", "/pricing")

  // User context
  userAgent: text("user_agent").notNull(),
  ip: text("ip"), // For geo-analysis if needed

  // Timestamps
  capturedAt: timestamp("captured_at").notNull(), // When the metric was captured in browser
  createdAt: timestamp("created_at").notNull().defaultNow(), // When the record was inserted
}, (table) => [
  // Index for time-series queries (most common query pattern)
  index("idx_web_vitals_captured_at").on(table.capturedAt.desc()),

  // Index for filtering by metric type
  index("idx_web_vitals_metric_name").on(table.metricName),

  // Composite index for page-specific analysis
  index("idx_web_vitals_page_metric").on(table.page, table.metricName),

  // Index for filtering by rating (to find poor performers)
  index("idx_web_vitals_rating").on(table.rating),

  // Composite index for time-based page analysis
  index("idx_web_vitals_page_captured").on(table.page, table.capturedAt.desc()),
]);

// Zod validation schemas
export const insertWebVitalSchema = createInsertSchema(webVitals, {
  metricName: z.enum(["CLS", "FCP", "LCP", "TTFB", "INP"]),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  value: z.number().min(0),
  delta: z.number().optional(),
  navigationType: z.enum(["navigate", "reload", "back-forward", "prerender"]).optional(),
  url: z.string().url(),
  page: z.string().min(1),
  userAgent: z.string().min(1),
  capturedAt: z.date(),
});

export const selectWebVitalSchema = createSelectSchema(webVitals);

// TypeScript types
export type WebVital = typeof webVitals.$inferSelect;
export type NewWebVital = typeof webVitals.$inferInsert;

/**
 * Web Vitals thresholds based on Google's Core Web Vitals recommendations
 * https://web.dev/vitals/
 */
export const WEB_VITAL_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 }, // milliseconds
  LCP: { good: 2500, poor: 4000 }, // milliseconds
  TTFB: { good: 800, poor: 1800 }, // milliseconds
  INP: { good: 200, poor: 500 }, // milliseconds
} as const;

/**
 * Helper to determine rating based on value
 */
export function getWebVitalRating(
  metricName: "CLS" | "FCP" | "LCP" | "TTFB" | "INP",
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds = WEB_VITAL_THRESHOLDS[metricName];

  if (value <= thresholds.good) {
    return "good";
  } else if (value <= thresholds.poor) {
    return "needs-improvement";
  } else {
    return "poor";
  }
}
