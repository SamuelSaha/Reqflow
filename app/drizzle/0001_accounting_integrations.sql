-- Migration: Add accounting integrations and sync fields
-- Created: 2026-02-26
-- Purpose: Support QuickBooks and Xero OAuth integration with PO sync

-- Create accounting_integrations table
CREATE TABLE IF NOT EXISTS "accounting_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
	"provider" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"token_expires_at" timestamp NOT NULL,
	"provider_account_id" text NOT NULL,
	"provider_account_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp,
	"last_sync_error" text,
	"auto_sync" boolean DEFAULT true NOT NULL,
	"config" jsonb,
	"connected_by" uuid,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create accounting_sync_logs table
CREATE TABLE IF NOT EXISTS "accounting_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"action" text NOT NULL,
	"success" boolean NOT NULL,
	"provider_reference" text,
	"error_message" text,
	"error_code" text,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"synced_at" timestamp DEFAULT now() NOT NULL,
	"synced_by" uuid
);

-- Add accounting sync fields to requests table
ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "synced_to_accounting" boolean DEFAULT false NOT NULL;
ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "accounting_sync_ref" text;
ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "accounting_sync_provider" text;
ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "accounting_sync_error" text;
ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "last_sync_attempt" timestamp;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "accounting_integrations_tenant_idx" ON "accounting_integrations"("tenant_id");
CREATE INDEX IF NOT EXISTS "accounting_integrations_provider_idx" ON "accounting_integrations"("provider");
CREATE INDEX IF NOT EXISTS "accounting_sync_logs_tenant_idx" ON "accounting_sync_logs"("tenant_id");
CREATE INDEX IF NOT EXISTS "accounting_sync_logs_entity_idx" ON "accounting_sync_logs"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "requests_synced_idx" ON "requests"("synced_to_accounting");

-- Add unique constraint: one integration per tenant per provider
CREATE UNIQUE INDEX IF NOT EXISTS "accounting_integrations_tenant_provider_unique"
  ON "accounting_integrations"("tenant_id", "provider")
  WHERE "is_active" = true;
