-- Add encrypted Anthropic API key to organizations (Bring Your Own API Key)
-- Encrypted at rest with AES-256-GCM via FIELD_ENCRYPTION_KEY
ALTER TABLE "organizations" ADD COLUMN "anthropic_api_key" text;
