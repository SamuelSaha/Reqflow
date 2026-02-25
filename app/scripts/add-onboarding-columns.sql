-- Add missing onboarding columns to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 0;
