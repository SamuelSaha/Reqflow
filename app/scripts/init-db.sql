-- Database initialization script
-- This runs once when the PostgreSQL container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search and duplicate detection
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For better index performance

-- Create custom types (if needed)
-- These will be defined by Drizzle migrations, but we can prepare the database

-- Log initialization
SELECT 'Reqflow database initialized successfully' AS status;
