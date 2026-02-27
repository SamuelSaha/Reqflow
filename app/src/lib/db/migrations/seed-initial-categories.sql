-- ============================================================================
-- SEED INITIAL CATEGORIES
-- Version: 1.0.0
-- Date: 2026-02-27
-- Description: Seeds default categories for all tenants and migrates existing requests
-- ============================================================================

-- Insert default categories for each tenant
INSERT INTO categories (tenant_id, name, slug, description, color, icon, is_system)
SELECT DISTINCT 
  tenant_id,
  'SaaS',
  'saas',
  'Software as a Service subscriptions',
  '#3B82F6',
  'cloud',
  true
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO categories (tenant_id, name, slug, description, color, icon, is_system)
SELECT DISTINCT 
  tenant_id,
  'Professional Services',
  'services',
  'Consulting, legal, accounting, and professional services',
  '#8B5CF6',
  'briefcase',
  true
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO categories (tenant_id, name, slug, description, color, icon, is_system)
SELECT DISTINCT 
  tenant_id,
  'Office Supplies',
  'office',
  'Office equipment, furniture, and supplies',
  '#10B981',
  'building',
  true
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO categories (tenant_id, name, slug, description, color, icon, is_system)
SELECT DISTINCT 
  tenant_id,
  'Travel & Expenses',
  'travel',
  'Business travel, accommodation, and employee expenses',
  '#F59E0B',
  'plane',
  true
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO categories (tenant_id, name, slug, description, color, icon, is_system)
SELECT DISTINCT 
  tenant_id,
  'Hardware',
  'hardware',
  'Computer hardware, devices, and equipment',
  '#EF4444',
  'server',
  true
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO categories (tenant_id, name, slug, description, color, icon, is_system)
SELECT DISTINCT 
  tenant_id,
  'Other',
  'other',
  'Miscellaneous expenses',
  '#6B7280',
  'more-horizontal',
  true
FROM organizations
ON CONFLICT DO NOTHING;

-- Migrate existing requests to use category_id
UPDATE requests SET category_id = (
  SELECT id FROM categories 
  WHERE categories.tenant_id = requests.tenant_id 
  AND categories.slug = requests.category
  LIMIT 1
)
WHERE requests.category IS NOT NULL AND requests.category_id IS NULL;

-- Log migration stats
DO $$
DECLARE
  category_count INTEGER;
  request_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM categories;
  SELECT COUNT(*) INTO request_count FROM requests WHERE category_id IS NOT NULL;
  RAISE NOTICE 'Migration complete: % categories created, % requests migrated', category_count, request_count;
END $$;
