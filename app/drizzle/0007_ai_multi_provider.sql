-- Add multi-provider AI support (Issue #35)
-- Adds ai_provider + ai_api_key columns; backfills from existing anthropic_api_key

ALTER TABLE "organizations"
  ADD COLUMN "ai_provider" text NOT NULL DEFAULT 'anthropic',
  ADD COLUMN "ai_api_key" text;

-- Backfill: existing Anthropic keys migrate to the new unified column
UPDATE "organizations"
  SET "ai_api_key" = "anthropic_api_key"
  WHERE "anthropic_api_key" IS NOT NULL;
