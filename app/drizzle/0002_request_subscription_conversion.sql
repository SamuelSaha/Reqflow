-- Migration: Add bidirectional linking between requests and subscriptions
-- Created: 2026-03-01
-- Purpose: Support request-to-subscription conversion workflow (#93)

-- Add sourceRequestId to subscriptions table
ALTER TABLE "subscriptions" ADD COLUMN "source_request_id" uuid;
--> statement-breakpoint
-- Add convertedToSubscriptionId to requests table
ALTER TABLE "requests" ADD COLUMN "converted_to_subscription_id" uuid;
--> statement-breakpoint
-- Add foreign key constraint for source_request_id
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_source_request_id_requests_id_fk" FOREIGN KEY ("source_request_id") REFERENCES "requests"("id") ON DELETE set null;
--> statement-breakpoint
-- Add foreign key constraint for converted_to_subscription_id
ALTER TABLE "requests" ADD CONSTRAINT "requests_converted_to_subscription_id_subscriptions_id_fk" FOREIGN KEY ("converted_to_subscription_id") REFERENCES "subscriptions"("id") ON DELETE set null;
--> statement-breakpoint
-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "subscriptions_source_request_idx" ON "subscriptions" ("source_request_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "requests_converted_to_subscription_idx" ON "requests" ("converted_to_subscription_id");
