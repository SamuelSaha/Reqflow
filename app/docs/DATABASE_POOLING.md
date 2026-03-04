# Database Connection Pooling

## Overview

Reqflow uses **dual connection pools** to optimize performance for different workload types:

1. **API Pool** - For tRPC queries and HTTP route handlers (short-lived, high-volume)
2. **Worker Pool** - For BullMQ background jobs (long-running, lower-volume)

This separation prevents long-running jobs from blocking API requests and vice versa.

## Architecture

```
┌─────────────────────┐
│   tRPC API Layer    │
│  (100 req/min/user) │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │   API Pool   │  ← 10 connections (production)
    │   (db)       │  ← max_lifetime: 1 hour
    └──────┬───────┘  ← prepared statements: ON
           │
           ▼
    ┌──────────────────┐
    │   PostgreSQL     │
    │   Database       │
    └──────────────────┘
           ▲
           │
    ┌──────┴───────┐
    │ Worker Pool  │  ← 3 connections (production)
    │ (workerDb)   │  ← max_lifetime: 1 hour
    └──────────────┘  ← idle_timeout: 60s
           ▲
           │
┌──────────┴──────────┐
│  BullMQ Workers     │
│  (5 concurrent)     │
└─────────────────────┘
```

## Configuration by Environment

### Serverless (Vercel)

```typescript
{
  max: 1,                  // Single connection per lambda
  idle_timeout: 0,         // Close immediately
  max_lifetime: 1800,      // 30 minutes
  prepare: false           // No prepared statements
}
```

**Rationale**: Serverless functions are ephemeral. Each lambda gets 1 connection that closes immediately after use to prevent connection buildup across thousands of lambdas.

### Production (Long-running server)

#### API Pool
```typescript
{
  max: 10,                 // Handle ~1000 req/min
  idle_timeout: 30,        // Keep alive for request bursts
  max_lifetime: 3600,      // Recycle after 1 hour
  prepare: true            // Cache prepared statements
}
```

**Rationale**:
- With 100 req/min rate limit per user, 10 connections handle ~1000 req/min total
- Each request holds connection briefly (10-50ms for typical queries)
- Prepared statements reduce query parsing overhead

#### Worker Pool
```typescript
{
  max: 3,                  // Fewer long-running jobs
  idle_timeout: 60,        // Longer idle (jobs are less frequent)
  max_lifetime: 3600,      // Recycle after 1 hour
  prepare: true            // Cache prepared statements
}
```

**Rationale**:
- BullMQ processes 5 concurrent jobs by default
- Each job holds connection longer (1-10s for transactions)
- 3 connections provide headroom for job bursts

### Development

```typescript
{
  max: 5,                  // Small shared pool
  idle_timeout: 20,        // Quick cleanup
  prepare: false           // Faster reload during dev
}
```

**Rationale**: Single shared pool keeps dev setup simple. No prepared statements for faster hot-reload.

## Pool Sizing Guidelines

### How to Calculate Pool Size

**Formula**: `connections = (concurrent_requests × average_query_time) / 1000`

Example for API pool:
- Rate limit: 100 req/min/user × 10 users = 1000 req/min
- Average query time: 30ms
- Peak concurrent: ~17 requests/sec
- Required connections: (17 × 30) / 1000 = ~1 connection

We use **10 connections** to provide 10× headroom for:
- Query spikes
- Slower queries (complex joins, analytics)
- Multiple queries per request

### Scaling Up

| User Load | API Pool | Worker Pool | Notes |
|-----------|----------|-------------|-------|
| 10 users  | 10       | 3           | Default (current) |
| 50 users  | 20       | 5           | Medium team |
| 100 users | 30       | 5           | Large team |
| 500 users | 50       | 10          | Enterprise |

**Important**: Most Postgres plans limit connections:
- Heroku Hobby: 20 connections
- Heroku Standard: 120 connections
- Neon Free: 100 connections
- Supabase Free: 60 connections

Leave 20% buffer for:
- Admin connections
- Migration tools
- Monitoring queries

## RLS and Connection Reuse

Reqflow uses Row-Level Security (RLS) with session variables:

```sql
SET app.tenant_id = 'tenant_123';
SET app.user_id = 'user_456';
```

**Critical**: Session variables are **per-connection**, not per-query. This means:

1. Connection cannot be reused across different tenants without clearing variables
2. RLS middleware (in `trpc.ts`) sets context before query, clears after
3. Connection recycling happens via `max_lifetime`, not manual reset

## Monitoring

### Health Endpoint

```bash
curl https://your-app.com/api/health/database
```

Response:
```json
{
  "status": "healthy",
  "latency": 15,
  "pools": {
    "api": { "maxConnections": 10 },
    "worker": { "maxConnections": 3 }
  }
}
```

### Database Query

Check active connections:

```sql
SELECT
  datname,
  usename,
  application_name,
  state,
  COUNT(*) as connections
FROM pg_stat_activity
WHERE datname = 'your_database'
GROUP BY datname, usename, application_name, state;
```

### Signs of Pool Exhaustion

- `504 Gateway Timeout` errors
- Slow API responses (>1s)
- `TimeoutError: Acquiring client from pool timed out` in logs

**Fix**: Increase `max` pool size or investigate slow queries.

## Graceful Shutdown

The app registers shutdown handlers that:

1. Close all database connections cleanly
2. Prevent new connections during shutdown
3. Wait up to 5 seconds for in-flight queries

Triggered by:
- `SIGTERM` (Docker/Kubernetes)
- `SIGINT` (Ctrl+C)
- `uncaughtException`
- `unhandledRejection`

## Best Practices

### DO ✅

- Use `db` for API queries (tRPC, route handlers)
- Use `workerDb` for background jobs (BullMQ workers)
- Keep queries fast (<100ms) to avoid holding connections
- Use indexes to speed up queries
- Monitor pool utilization in production

### DON'T ❌

- Don't create new connection pools in worker files
- Don't hold transactions open across async boundaries
- Don't use `db` in BullMQ workers (use `workerDb`)
- Don't set pool size > 80% of database connection limit
- Don't forget to close connections in tests

## Troubleshooting

### Problem: "too many clients already"

**Cause**: Total connections exceed database limit

**Fix**:
1. Check current connections: `SELECT count(*) FROM pg_stat_activity;`
2. Lower `max` in both pools
3. Upgrade database plan for more connections
4. Kill idle connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';`

### Problem: Slow API responses under load

**Cause**: Pool exhaustion (all connections busy)

**Fix**:
1. Check `api.health/database` endpoint
2. Increase API pool size
3. Profile slow queries with `EXPLAIN ANALYZE`
4. Add indexes to speed up queries

### Problem: Workers failing with connection timeouts

**Cause**: Long-running jobs holding connections

**Fix**:
1. Increase worker pool `max`
2. Reduce BullMQ `concurrency` in worker config
3. Split long jobs into smaller chunks
4. Use job batching to reduce database queries

## References

- [postgres.js Documentation](https://github.com/porsager/postgres)
- [Drizzle ORM Connection](https://orm.drizzle.team/docs/get-started-postgresql)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [BullMQ Concurrency](https://docs.bullmq.io/guide/workers/concurrency)
