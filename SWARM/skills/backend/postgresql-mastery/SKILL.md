---
name: PostgreSQL Mastery
description: Advanced PostgreSQL including query optimization, indexing, partitioning, replication, and row-level security
version: 1.0.0
primary_agents: ["@swarm-dev", "@swarm-arch", "@swarm-ops"]
---

# 🐘 PostgreSQL Mastery Skill

> **ACTIVATION:** "Apply postgresql-mastery skill for production-grade database performance"

---

## 🎯 Purpose

Ruthlessly effective PostgreSQL optimization for achieving sub-100ms query performance, 99.9% uptime, and scalable architecture that handles 10x load.

---

## 🏗️ Query Optimization

### 1.1 EXPLAIN ANALYZE Pattern

Every complex query must be analyzed:

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id
ORDER BY order_count DESC
LIMIT 100;
```

**Key Metrics to Check:**
- **Seq Scan** vs Index Scan → Seq Scan means missing index
- **Index Scan** → GOOD
- **Filter Condition** → Check if filter uses index
- **Execution Time** → Target < 100ms for most queries
- **Buffer Hit Ratio** → Target > 95% for index lookups

### 1.2 Index Strategy

Rule: Index what you query, not what you insert.

```sql
-- ✅ GOOD: Index for WHERE clause
CREATE INDEX idx_users_status_active ON users(status) 
WHERE status = 'active';

-- ✅ GOOD: Composite index for multi-column WHERE
CREATE INDEX idx_orders_user_created 
ON orders(user_id, created_at DESC);

-- ✅ GOOD: Covering index for SELECT-only
CREATE INDEX idx_orders_user_status_covering 
ON orders(user_id, status) 
INCLUDE (id, total, created_at);

-- ❌ BAD: Indexing low-cardinality column
CREATE INDEX idx_users_status ON users(status) 
-- WHERE status has only 2 values (active, inactive) = useless index

-- ❌ BAD: Indexing updated_at without range queries
CREATE INDEX idx_orders_created ON orders(created_at);
-- If you always query by user_id first, this is partial index

Partial Indexes for Large Tables:

```sql
-- Create index on commonly queried subset of data
CREATE INDEX idx_active_users_email 
ON users(email) 
WHERE status = 'active';

-- Use in queries
SELECT * FROM users 
WHERE email = 'user@example.com' 
AND status = 'active';
-- PostgreSQL will use partial index + filter
```

Anti-Patterns:
- ❌ SELECT * on large tables (select only needed columns)
- ❌ N+1 queries in loops (use JOIN or subquery)
- ❌ LIKE '%pattern%' for prefix search (use LEFT(pattern, index) or full-text)
- ❌ OR conditions on same column (use ANY or IN)
- ❌ CAST in WHERE clause (implicit casting prevents index use)
- ❌ ORDER BY on unindexed columns (add index or accept slow sort)
- ❌ DELETE without LIMIT on large tables (use batch deletes)
- ❌ Updating primary key (avoid, causes bloat)
- ❌ Text type for structured data (use structured types)
- ❌ Ignoring autovacuum (causes bloat, performance degradation)

---

## 🧪 PostgreSQL-Specific Features

### 3.1 Full-Text Search

Use for: Search functionality (10x faster than LIKE)

```sql
-- ✅ GOOD: Full-text search
ALTER TABLE products 
ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (to_tsvector('english', name || ' ' || description)) STORED;

-- Create GIN index
CREATE INDEX idx_products_search_vector 
ON products USING GIN (search_vector);

-- Search query
SELECT 
  id,
  name,
  description,
  ts_rank(search_vector, websearch_to_tsquery('english', 'laptop & case')) as rank
FROM products 
WHERE search_vector @@ websearch_to_tsquery('english', 'laptop & case')
ORDER BY rank DESC
LIMIT 20;

-- ✅ GOOD: Prefix search (autocomplete)
SELECT name FROM products 
WHERE search_vector @@ to_tsquery('english', 'lap:*') 
LIMIT 10;
```

### 3.2 Array Operations

Use for: Many-to-many relationships without junction tables

```sql
-- ✅ GOOD: Array column with GIN index
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  categories TEXT[] NOT NULL,  -- Array of categories
  tags TEXT[] NOT NULL  -- Array of tags
);

-- GIN index for array containment
CREATE INDEX idx_products_categories 
ON products USING GIN (categories);

-- Query for products in specific categories
SELECT * FROM products 
WHERE categories @> ARRAY['electronics', 'laptops'];

-- Array operations
SELECT 
  name,
  array_length(categories) as category_count,
  array_position('laptops'::text, categories) as laptop_position,
  unnest(categories) as individual_category
FROM products;
```

---

## 4. Partitioning Strategies

Use for: Tables > 10M rows to improve query performance

### 4.1 Range Partitioning (Time-Series)

```sql
-- ✅ GOOD: Partition orders by month
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL
) PARTITION BY RANGE (created_at);

-- Create partitions (can be automated)
CREATE TABLE orders_2024_01 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_2024_02 PARTITION OF orders
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Query automatically prunes irrelevant partitions
SELECT * FROM orders 
WHERE created_at >= '2024-01-15' 
  AND created_at < '2024-02-01';
-- PostgreSQL will only scan orders_2024_01 partition
```

### 4.2 List Partitioning

```sql
-- ✅ GOOD: Partition users by country
CREATE TABLE users (
  id UUID PRIMARY KEY,
  country_code TEXT NOT NULL,
  email TEXT NOT NULL
) PARTITION BY LIST (country_code);

-- Partitions per tenant
CREATE TABLE users_us PARTITION OF users
  FOR VALUES IN ('US');

CREATE TABLE users_uk PARTITION OF users
  FOR VALUES IN ('UK');

CREATE TABLE users_other PARTITION OF users
  DEFAULT;
```

### 4.3 Hash Partitioning

```sql
-- ✅ GOOD: Partition by hash for even distribution
CREATE TABLE events (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY HASH (user_id);

-- Automatically creates 4 partitions
-- Good for parallel queries across partitions
```

---

## 5. Replication and High Availability

### 5.1 Read Replicas

Use for: Read-heavy workloads, analytics queries

```sql
-- Read replicas handle read queries
-- Primary handles write queries

-- Application logic:
- Write operations (INSERT/UPDATE/DELETE) → Primary database
- Read operations (SELECT) → Read replica

-- Connection string difference:
-- Primary: postgresql://primary-db:5432/dbname
-- Replica: postgresql://replica-db:5432/dbname
```

### 5.2 Logical Replication

Use for: Zero-downtime upgrades, multi-region deployment

```bash
# pg_dump from primary
pg_dump -Fc -h primary-host -U postgres dbname | gzip > dump.sql.gz

# pg_restore to standby
gunzip -c dump.sql.gz | psql -h standby-host -U postgres dbname

# Setup replication
# In postgresql.conf:
wal_level = logical
max_replication_slots = 5

# Create publication on primary
CREATE PUBLICATION all_tables FOR ALL TABLES;

# Create subscription on standby
CREATE SUBSCRIPTION standby_sub 
CONNECTION 'postgres://primary-host/dbname' 
PUBLICATION all_tables;
```

---

## 6. Connection Pooling (PgBouncer)

Use for: Reducing connection overhead, handling 1000+ concurrent connections

```ini
# pgbouncer.ini
[databases]
dbname = host=postgres.internal port=5432 dbname=dbname

[pgbouncer]
listen_addr = *
listen_port = 6432
pool_mode = transaction
max_client_conn = 10000
default_pool_size = 25
reserve_pool_size = 5
server_lifetime = 3600
server_idle_timeout = 600

[users]
postgres = host=postgres.internal port=5432

-- Application connects to pgbouncer on port 6432
-- pgbouncer maintains connection pool to PostgreSQL on 5432
```

Benefits:
- Reduces connection overhead (Postgres connections are expensive)
- Handles connection spikes (transaction pooling)
- Prevents "too many connections" errors

---

## 7. Row-Level Security (RLS) Deep Dive

### 7.1 Advanced RLS Patterns

```sql
-- ✅ GOOD: Multi-tenant RLS with tenant_id
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own orders
CREATE POLICY orders_isolation_policy 
ON orders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ✅ GOOD: Role-based access
CREATE POLICY orders_admin_policy 
ON orders
FOR ALL
TO admin_role
USING (true);

-- ✅ GOOD: Time-based access
CREATE POLICY orders_recent_policy 
ON orders
FOR SELECT
USING (
  auth.uid() = user_id 
  AND created_at > NOW() - INTERVAL '90 days'
);

-- ✅ GOOD: Aggregate policy with OR conditions
CREATE POLICY orders_access_policy 
ON orders
FOR ALL
USING (
  auth.uid() = user_id 
  OR auth.role() = 'admin'
);
```

### 7.2 RLS with Joins

```sql
-- ✅ GOOD: RLS with related tables
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Can only see order items for orders they can access
CREATE POLICY order_items_isolation_policy 
ON order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
```

---

## 8. Performance Tuning

### 8.1 Critical PostgreSQL Parameters

```ini
# postgresql.conf

# Memory Settings (adjust based on server RAM)
shared_buffers = 256MB              -- 25% of RAM
effective_cache_size = 1GB             -- 50-75% of RAM
work_mem = 16MB                     -- Per operation
maintenance_work_mem = 512MB          -- VACUUM/CREATE INDEX

# Query Planning
random_page_cost = 1.1              -- Default 1.0, increase for SSDs
effective_io_concurrency = 200        -- Allow more parallel queries

# WAL Settings
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 1GB

# Connection Settings
max_connections = 200
max_worker_processes = 4              -- Set to CPU cores
```

### 8.2 VACUUM and Autovacuum

```sql
-- ✅ GOOD: Manual VACUUM for bloated tables
VACUUM (FULL, ANALYZE, VERBOSE) orders;

-- ✅ GOOD: Autovacuum tuning
ALTER TABLE orders SET (
  autovacuum_enabled = true,
  autovacuum_vacuum_threshold = 0.1,  -- 10% of rows
  autovacuum_analyze_threshold = 0.05   -- 5% of rows
  autovacuum_vacuum_scale_factor = 1.0,
  autovacuum_analyze_scale_factor = 1.0
);
```

### 8.3 Monitoring Queries

```sql
-- Identify slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100  -- Slower than 100ms
ORDER BY mean_time DESC
LIMIT 20;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0 OR idx_tup_fetch / idx_tup_read > 10
ORDER BY idx_tup_read DESC;

-- Check table bloat
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(table_size) as size,
  pg_size_pretty(index_size) as index_size,
  pg_size_pretty(table_size - index_size) as bloat
FROM (
  SELECT 
    schemaname,
    tablename,
    pg_relation_size(schemaname||'.'||tablename) as table_size,
    pg_indexes_size(schemaname||'.'||tablename) as index_size,
    pg_relation_size(table_size) - pg_indexes_size(index_size) as bloat
  FROM pg_tables
) t
WHERE pg_relation_size(table_size) - pg_indexes_size(index_size) > 100MB
ORDER BY bloat DESC
LIMIT 10;
```

---

## 9. Verification Checklist

Query Performance:
- [ ] All complex queries have EXPLAIN ANALYZE
- [ ] No sequential scans on large tables (use indexes)
- [ ] Buffer hit ratio > 95%
- [ ] Query time < 100ms for 95th percentile

Schema Design:
- [ ] Tables follow 3NF (denormalize only for performance)
- [ ] Foreign keys indexed
- [ ] No partial indexes (index full predicate or use partial index)
- [ ] JSONB used only for flexible schema (not relational data)

Partitioning:
- [ ] Partitions exist for tables > 10M rows
- [ ] Partition pruning works (EXPLAIN shows only relevant partitions)
- [ ] Partition maintenance job scheduled

Security:
- [ ] RLS enabled on all tenant data
- [ ] No GRANT usage (use roles and policies)
- [ ] Row-level security tested with auth.uid()

Performance:
- [ ] shared_buffers set to 25% of RAM
- [ ] work_mem tested for memory usage
- [ ] Autovacuum tuned (thresholds, scale factors)
- [ ] Connection pooling configured (PgBouncer)

High Availability:
- [ ] Read replicas configured for read-heavy workloads
- [ ] Backup strategy tested (pg_dump + restore)
- [ ] Failover procedure documented

---

## 📊 Performance Targets

| Metric | Good | Needs Work | Poor |
|--------|-------|-----------|-------|
| Query Time (P50) | < 50ms | < 20ms | 50-100ms | > 100ms |
| Query Time (P95) | < 100ms | < 50ms | 100-200ms | > 200ms |
| Query Time (P99) | < 500ms | < 200ms | 200-500ms | > 500ms |
| Buffer Hit Ratio | > 95% | > 98% | 90-95% | < 90% |
| Table Bloat | < 10% | < 5% | 10-25% | > 25% |
| Index Usage | > 95% | > 99% | 80-95% | < 80% |

---

## ⚠️ Anti-Patterns

DON'T DO:
- ❌ SELECT * on large tables (select only needed columns)
- ❌ N+1 queries in loops (use JOIN or subquery)
- ❌ LIKE '%pattern%' for prefix search (use LEFT(pattern, index) or full-text)
- ❌ OR conditions on same column (use ANY or IN)
- ❌ CAST in WHERE clause (implicit casting prevents index use)
- ❌ ORDER BY on unindexed columns (add index or accept slow sort)
- ❌ DELETE without LIMIT on large tables (use batch deletes)
- ❌ Updating primary key (avoid, causes bloat)
- ❌ Text type for structured data (use structured types)
- ❌ Ignoring VACUUM (causes bloat, performance degradation)

DO:
1. Specify columns (Reduces I/O)
2. Use EXPLAIN ANALYZE (Before deploying queries)
3. Monitor pg_stat_statements (Track slow queries)
4. Index what you query (Not what you insert)
5. Partition time-series data (Improves query speed)
6. Use connection pooling (PgBouncer)
7. Set appropriate work_mem (Prevents disk spills)
8. Tune autovacuum (Prevents bloat)

---

## 🎯 Decision Matrix

When to Use Advanced Features:

| Feature | Use When | Don't Use When |
|----------|------------|-----------------|
| Full-Text Search | Search functionality, text filtering | Exact match, structured queries |
| JSONB | Flexible metadata, schema evolution | Relational data, fixed schema |
| Arrays | Many-to-many without junction table | Few values, simple relationship |
| Partitioning | Tables > 10M rows, time-series | Small tables, random access patterns |
| Replication | Read-heavy, multi-region | Write-heavy, single region |
| RLS | Multi-tenant, row-level security | Single-tenant, admin-only tables |

---

**Skill Version:** 1.0.0
**Last Updated:** 2026-02-02
'POSTGRESQLEOF'