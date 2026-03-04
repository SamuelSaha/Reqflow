# Database Connection Pooling

**Status:** ✅ Production Ready with Advanced Monitoring
**Last Updated:** 2026-03-04

---

## Overview

Reqflow uses sophisticated connection pooling to optimize database performance across different environments. The system automatically adapts pool configuration based on the deployment environment (serverless, production, development) and supports external connection poolers for enhanced serverless performance.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  ┌────────────┐              ┌──────────────┐          │
│  │ tRPC/API   │              │ BullMQ Workers│          │
│  │ Requests   │              │ (Background)  │          │
│  └─────┬──────┘              └───────┬───────┘          │
│        │                             │                  │
│        v                             v                  │
│  ┌─────────────┐              ┌──────────────┐          │
│  │ API Pool    │              │ Worker Pool  │          │
│  │ (max=10)    │              │ (max=3)      │          │
│  │ Short-lived │              │ Long-running │          │
│  └─────┬───────┘              └───────┬──────┘          │
└────────┼──────────────────────────────┼─────────────────┘
         │                              │
         v                              v
    ┌────────────────────────────────────────────┐
    │     Connection Pooler (Optional)           │
    │   Neon / Supabase / PgBouncer / RDS Proxy │
    │   - Multiplexes connections               │
    │   - Reduces cold starts                   │
    │   - Transaction/Session pooling           │
    └────────────────┬───────────────────────────┘
                     │
                     v
            ┌─────────────────┐
            │   PostgreSQL    │
            │   max_connections: 100                                       │
            └─────────────────┘
```

---

## Environment Configurations

### 1. Serverless (Vercel)

**Challenge:** Each serverless function can create new connections, quickly exhausting database limits.

**Strategy:**
```typescript
// Single connection per function (without pooler)
max: 1,
idle_timeout: 0, // Close immediately
max_lifetime: 60 * 30, // 30 minutes

// With connection pooler (recommended)
max: 2, // Can handle 2-3 concurrent requests
idle_timeout: 0,
prepare: false, // Pooler handles prepared statements
```

**Recommended Setup:**
```bash
# Use connection pooler for serverless
DATABASE_POOLER_URL=postgresql://user:pass@pooler.neon.tech/db
```

**Benefits:**
- Prevents connection exhaustion
- Faster cold starts
- Automatic connection recycling

---

### 2. Production (Long-Running Server)

**Strategy:** Separate pools for different workload types.

```typescript
// API Pool: High-volume, short-lived queries
{
  max: 10,
  idle_timeout: 30, // Keep alive for bursts
  max_lifetime: 60 * 60, // 1 hour
  prepare: true, // Cached prepared statements
}

// Worker Pool: Lower-volume, long-running transactions
{
  max: 3,
  idle_timeout: 60,
  max_lifetime: 60 * 60,
  prepare: true,
}
```

**Total Connections:** 13 (safe for most PostgreSQL plans)

**Pool Sizing Rationale:**
- Each tRPC request holds connection ~10-50ms
- 10 connections handle ~1000 requests/minute
- BullMQ workers process 1-10s jobs, need fewer connections
- RLS session variables require connection recycling

---

### 3. Development

**Strategy:** Small shared pool for local testing.

```typescript
{
  max: 5,
  idle_timeout: 20,
  prepare: false, // Faster reload during dev
}
```

Worker pool reuses API pool in development.

---

## Connection Pooler Setup

### Option 1: Neon (Recommended for Vercel)

**Features:**
- Automatic connection pooling
- Instant cold starts
- No configuration needed

**Setup:**
```bash
# 1. Get pooled connection string from Neon dashboard
DATABASE_POOLER_URL=postgresql://user:pass@ep-XXX.pooler.neon.tech/db

# 2. Keep direct connection for migrations
DATABASE_URL=postgresql://user:pass@ep-XXX.region.neon.tech/db
```

**Pooling Mode:** Transaction pooling (automatic)

---

### Option 2: Supabase Pooler

**Features:**
- Built-in connection pooling
- Transaction and session modes
- 6543 port for pooled connections

**Setup:**
```bash
# Pooled connection (port 6543)
DATABASE_POOLER_URL=postgresql://user:pass@db.PROJECT.supabase.co:6543/postgres

# Direct connection for migrations (port 5432)
DATABASE_URL=postgresql://user:pass@db.PROJECT.supabase.co:5432/postgres
```

**Pooling Mode:** Transaction mode (default)

---

### Option 3: PgBouncer (Self-Hosted)

**Features:**
- Maximum control
- Transaction, session, or statement pooling
- Supports prepared statements (session mode)

**Setup:**
```ini
# pgbouncer.ini
[databases]
reqflow = host=postgres.internal port=5432 dbname=reqflow

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

```bash
# Application uses PgBouncer
DATABASE_POOLER_URL=postgresql://user:pass@pgbouncer:6432/reqflow

# Migrations use direct connection
DATABASE_URL=postgresql://user:pass@postgres:5432/reqflow
```

**Pooling Modes:**
- `transaction`: Best for most applications (stateless between transactions)
- `session`: Needed for prepared statements, temp tables, advisory locks
- `statement`: Most aggressive, rarely used

---

### Option 4: AWS RDS Proxy

**Features:**
- Managed service for AWS RDS
- IAM authentication
- Automatic failover

**Setup:**
```bash
# RDS Proxy endpoint
DATABASE_POOLER_URL=postgresql://user:pass@proxy-name.proxy-XXX.region.rds.amazonaws.com:5432/db

# Direct RDS endpoint
DATABASE_URL=postgresql://user:pass@instance.XXX.region.rds.amazonaws.com:5432/db
```

---

## Monitoring & Observability

### Real-Time Pool Statistics

**API Endpoint:**
```bash
GET /api/admin/pool-stats
Authorization: Admin only
```

**Response:**
```json
{
  "health": {
    "isHealthy": true,
    "warnings": [],
    "timestamp": "2026-03-04T..."
  },
  "limits": {
    "maxConnections": 100,
    "currentConnections": 15,
    "availableConnections": 85,
    "utilizationPercent": "15.0"
  },
  "apiPool": {
    "metrics": {
      "totalConnections": 8,
      "activeConnections": 3,
      "idleConnections": 5,
      "idleInTransaction": 0,
      "waitingConnections": 0,
      "utilizationPercent": 80.0
    }
  },
  "workerPool": { ... },
  "slowQueries": { ... },
  "recommendations": [
    "✅ Connection pool is healthy. No action needed."
  ]
}
```

### Programmatic Monitoring

```typescript
import {
  getApiPoolMetrics,
  getSlowQueries,
  getConnectionLimits,
} from "@/lib/db";

// Get real-time metrics
const metrics = await getApiPoolMetrics();

// Check for slow queries
const slowQueries = await getSlowQueries(1000); // > 1 second

// Get connection limits
const limits = await getConnectionLimits();
```

### Metrics Tracked

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| `totalConnections` | Total connections in use | > 80% of max |
| `activeConnections` | Currently executing queries | - |
| `idleConnections` | Idle but allocated connections | - |
| `idleInTransaction` | Stuck transactions | > 5 |
| `waitingConnections` | Connections waiting for resources | > 10 |
| `utilizationPercent` | Percentage of max connections used | > 80% |

---

## Performance Optimization

### 1. Query Optimization

**Identify Slow Queries:**
```typescript
const slowQueries = await getSlowQueries(1000);

// Log slow queries
slowQueries.forEach((q) => {
  logger.warn("Slow query detected", {
    duration: q.duration,
    query: q.query,
  });
});
```

**Index Missing Columns:**
```sql
-- Check for sequential scans
SELECT schemaname, tablename, seq_scan, seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 100
  AND seq_tup_read / seq_scan > 1000
ORDER BY seq_tup_read DESC;

-- Add indexes
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_approvals_status_approver ON approvals(status, approver_id);
```

---

### 2. Connection Reuse

**Best Practices:**
```typescript
// ✅ Good: Single query
const users = await db.select().from(usersTable);

// ❌ Bad: Multiple queries in loop (N+1 problem)
for (const user of users) {
  const profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, user.id));
}

// ✅ Good: Single join query
const usersWithProfiles = await db
  .select()
  .from(usersTable)
  .leftJoin(profilesTable, eq(usersTable.id, profilesTable.userId));
```

---

### 3. Transaction Handling

**Keep Transactions Short:**
```typescript
// ❌ Bad: Long transaction with external calls
await db.transaction(async (tx) => {
  await tx.insert(requestsTable).values({ ... });
  await sendEmail(recipient); // External call inside transaction!
  await tx.update(requestsTable).set({ ... });
});

// ✅ Good: Short transaction, external calls outside
const request = await db.transaction(async (tx) => {
  const [req] = await tx.insert(requestsTable).values({ ... }).returning();
  return req;
});

// External call after transaction commits
await sendEmail(request.requester.email);
```

---

### 4. Pool Size Tuning

**Formula:**
```
connections_needed = ((core_count * 2) + effective_spindle_count)

For most cloud databases:
- Web app: 10-20 connections per instance
- Worker: 3-5 connections per instance
- Total: cores * 2 + 5
```

**Example:** 4-core server
```
API: 10 connections
Workers: 3 connections
Total: 13 connections (well under 100 max)
```

---

## Troubleshooting

### Connection Pool Exhausted

**Symptoms:**
- Timeout errors
- Requests hanging
- "too many connections" errors

**Diagnosis:**
```typescript
const metrics = await getApiPoolMetrics();

if (metrics.utilizationPercent > 80) {
  logger.error("High connection usage", { metrics });
}
```

**Solutions:**
1. **Enable connection pooler:**
   ```bash
   DATABASE_POOLER_URL=postgresql://...pooler.neon.tech/...
   ```

2. **Increase max_connections** (database server):
   ```sql
   ALTER SYSTEM SET max_connections = 200;
   SELECT pg_reload_conf();
   ```

3. **Reduce pool size** (application):
   ```typescript
   // Reduce API pool from 10 to 5
   max: 5,
   ```

4. **Kill idle transactions:**
   ```typescript
   import { killIdleInTransactionConnections } from "@/lib/db/pool-monitor";

   await killIdleInTransactionConnections(apiQueryClient, 300); // 5 min
   ```

---

### Idle in Transaction

**Symptoms:**
- Connections stuck in "idle in transaction" state
- Locks not released
- Deadlocks

**Diagnosis:**
```sql
SELECT pid, state, state_change, query
FROM pg_stat_activity
WHERE state = 'idle in transaction'
  AND NOW() - state_change > interval '5 minutes';
```

**Solutions:**
1. **Review transaction boundaries:**
   ```typescript
   // Ensure transactions complete
   await db.transaction(async (tx) => {
     // ... queries ...
   }); // Auto-commit or rollback
   ```

2. **Set statement timeout:**
   ```sql
   SET statement_timeout = '30s';
   ```

3. **Auto-kill stuck transactions:**
   ```typescript
   // In health check cron job
   await killIdleInTransactionConnections(client, 300);
   ```

---

### Slow Queries

**Diagnosis:**
```typescript
const slowQueries = await getSlowQueries(1000);

slowQueries.forEach((q) => {
  logger.warn("Slow query", {
    duration: q.duration,
    query: q.query,
    state: q.state,
  });
});
```

**Solutions:**
1. **Add indexes:**
   ```sql
   CREATE INDEX idx_column ON table(column);
   ```

2. **Use EXPLAIN ANALYZE:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM requests WHERE status = 'pending';
   ```

3. **Optimize query:**
   ```typescript
   // Use select() with specific columns
   const requests = await db
     .select({ id: requestsTable.id, title: requestsTable.title })
     .from(requestsTable);
   ```

---

## Best Practices

### ✅ Do

1. **Use connection pooler in serverless**
2. **Keep transactions short**
3. **Close connections gracefully on shutdown**
4. **Monitor pool health regularly**
5. **Index frequently queried columns**
6. **Use prepared statements in production**
7. **Set connection timeouts**

### ❌ Don't

1. **Don't create connections per request**
2. **Don't hold connections during external API calls**
3. **Don't use `SELECT *` in production**
4. **Don't forget to close connections in tests**
5. **Don't set pool size higher than database max**
6. **Don't use pooler for migrations** (use direct connection)

---

## Migration Strategy

**Important:** Always use direct DATABASE_URL for migrations, not pooler.

```typescript
// migrations/migrate.ts
import postgres from "postgres";

// Use direct connection (not pooler)
const migrationClient = postgres(process.env.DATABASE_URL!, {
  max: 1,
  onnotice: () => {}, // Suppress migration notices
});

// Run migrations
await migrate(drizzle(migrationClient), {
  migrationsFolder: "./migrations",
});

await migrationClient.end();
```

**Why?**
- Migrations need session-level state (DDL locks)
- Poolers in transaction mode don't preserve session state
- Direct connection ensures consistent migration execution

---

## Monitoring Integration

### Axiom Logging

```typescript
import { logger } from "@/lib/monitoring/logger";

// Log pool metrics
logger.info("Database pool metrics", await getApiPoolMetrics());

// Alert on high usage
if (metrics.utilizationPercent > 80) {
  logger.error("High database connection usage", { metrics });
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const isHealthy = await checkDbHealth();
  const metrics = await getApiPoolMetrics();

  return NextResponse.json({
    status: isHealthy && metrics.isHealthy ? "healthy" : "degraded",
    database: {
      connected: isHealthy,
      poolHealth: metrics.isHealthy,
      warnings: metrics.warnings,
    },
  });
}
```

---

## Cost Optimization

### Connection Limits by Provider

| Provider | Free Tier | Paid Plans |
|----------|-----------|------------|
| Neon | 100 connections | 1000+ connections |
| Supabase | 60 connections | 500+ connections |
| AWS RDS | 100-5000 (instance-dependent) | Up to 5000 |
| Heroku | 20 connections | 120+ connections |

### Strategies

1. **Use connection pooler** - Reduces need for higher-tier plans
2. **Optimize pool size** - Don't over-provision
3. **Scale horizontally** - Multiple app instances with smaller pools
4. **Use read replicas** - Distribute read-heavy queries

---

## Related Documentation

- [Database Schema](./SCHEMA.md)
- [Query Optimization](./QUERY_OPTIMIZATION.md)
- [Monitoring Guide](../monitoring/MONITORING.md)
- [Deployment Guide](../devops/DEPLOYMENT.md)

---

**Maintained by:** Database Team
**Support:** File an issue with label `database` / `performance`
