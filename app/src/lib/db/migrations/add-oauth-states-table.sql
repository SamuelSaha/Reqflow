-- ============================================================================
-- OAUTH STATE TOKENS TABLE
-- Version: 1.0.0
-- Date: 2026-02-27
-- Description: Adds oauth_states table for OAuth CSRF protection
-- Security Fix: Issue #101 - CVSS 7.0
-- ============================================================================

-- Create oauth_states table
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  state TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_provider ON oauth_states(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_states_tenant_id ON oauth_states(tenant_id);

-- Add comments
COMMENT ON TABLE oauth_states IS 'Stores OAuth state tokens for CSRF protection with 10-minute expiry';
COMMENT ON COLUMN oauth_states.state IS '32-byte random hex token for CSRF protection';
COMMENT ON COLUMN oauth_states.expires_at IS 'Token expiry (10 minutes from creation)';
COMMENT ON COLUMN oauth_states.provider IS 'OAuth provider (quickbooks, xero)';

-- Enable RLS
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own tenant's OAuth states
CREATE POLICY oauth_states_tenant_isolation ON oauth_states
  FOR ALL
  USING (tenant_id = app.current_tenant_id());

-- Grant access to authenticated role (if using)
-- GRANT ALL ON oauth_states TO authenticated;
