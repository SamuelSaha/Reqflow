-- Full-text search with PostgreSQL tsvector
-- Issue #102: Add tsvector columns with GIN indexes for fast search

-- ===== REQUESTS =====
-- Add tsvector column
ALTER TABLE requests ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS requests_search_idx ON requests USING GIN (search_vector);

-- Create function to update search_vector
CREATE OR REPLACE FUNCTION requests_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.request_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.vendor_name, '')), 'A');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update on INSERT/UPDATE
DROP TRIGGER IF EXISTS requests_search_vector_trigger ON requests;
CREATE TRIGGER requests_search_vector_trigger
  BEFORE INSERT OR UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION requests_search_vector_update();

-- Backfill existing records
UPDATE requests SET search_vector =
  setweight(to_tsvector('english', COALESCE(request_number, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(vendor_name, '')), 'A')
WHERE search_vector IS NULL;

-- ===== VENDORS =====
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS vendors_search_idx ON vendors USING GIN (search_vector);

CREATE OR REPLACE FUNCTION vendors_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.legal_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.website, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendors_search_vector_trigger ON vendors;
CREATE TRIGGER vendors_search_vector_trigger
  BEFORE INSERT OR UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION vendors_search_vector_update();

UPDATE vendors SET search_vector =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(legal_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(website, '')), 'C')
WHERE search_vector IS NULL;

-- ===== CONTRACTS =====
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS contracts_search_idx ON contracts USING GIN (search_vector);

CREATE OR REPLACE FUNCTION contracts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.terms, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.renewal_terms, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contracts_search_vector_trigger ON contracts;
CREATE TRIGGER contracts_search_vector_trigger
  BEFORE INSERT OR UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION contracts_search_vector_update();

UPDATE contracts SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(terms, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(renewal_terms, '')), 'C')
WHERE search_vector IS NULL;

-- ===== INVOICES =====
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS invoices_search_idx ON invoices USING GIN (search_vector);

CREATE OR REPLACE FUNCTION invoices_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.invoice_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.external_ref, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS invoices_search_vector_trigger ON invoices;
CREATE TRIGGER invoices_search_vector_trigger
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION invoices_search_vector_update();

UPDATE invoices SET search_vector =
  setweight(to_tsvector('english', COALESCE(invoice_number, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(external_ref, '')), 'B')
WHERE search_vector IS NULL;
