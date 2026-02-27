-- ============================================================================
-- CATEGORIES TABLE MIGRATION
-- Version: 1.0.0
-- Date: 2026-02-27
-- Description: Adds categories table for custom spend classification
-- ============================================================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'tag',
  gl_account_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_tenant_slug ON categories(tenant_id, slug);

-- Add category_id foreign key to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE requests ALTER COLUMN category DROP NOT NULL;

-- Create index on category_id
CREATE INDEX IF NOT EXISTS idx_requests_category_id ON requests(category_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their tenant's categories
CREATE POLICY categories_tenant_isolation ON categories
  FOR ALL
  USING (tenant_id = app.current_tenant_id());

-- Add comments
COMMENT ON TABLE categories IS 'Custom spend categories for classification and GL mapping';
COMMENT ON COLUMN categories.slug IS 'Unique identifier within tenant (lowercase-hyphenated)';
COMMENT ON COLUMN categories.color IS 'Hex color code for UI display';
COMMENT ON COLUMN categories.gl_account_code IS 'General ledger account code for accounting sync';
COMMENT ON COLUMN categories.is_system IS 'System categories cannot be deleted or modified';
