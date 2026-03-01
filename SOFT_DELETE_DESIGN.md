# Soft Delete Design - Issue #81

## Overview
Implements soft delete functionality to enable undo for destructive user actions in Reqflow.

## Migration File
`/Users/samuelsaha/emdash-projects/Reqflow/app/src/lib/db/migrations/add-soft-delete-columns.sql`

## Tables Modified

### ✅ Tables with Soft Delete

| Table | Use Case | Rationale |
|-------|----------|-----------|
| `requests` | Delete draft requests | Users frequently change their minds about draft requests before submission |
| `trials` | Cancel trial tracking | Accidentally deleted trial records should be recoverable |
| `budgets` | Delete budget allocations | Project budgets may be deleted but need to be restored if still needed |
| `users` | Remove team members | Accidental team member removal should be easily reversible |

### ❌ Tables WITHOUT Soft Delete

| Table | Reason | Alternative |
|-------|--------|-------------|
| `approvals` | Rejection is a state change, not deletion | Use existing `decision` field ("pending" → "rejected"). Audit logs capture decision changes via `before`/`after` fields. |

## Schema Changes

Each affected table receives:

```sql
deleted_at TIMESTAMP        -- NULL = active, NOT NULL = deleted
deleted_by UUID            -- References users.id (who deleted it)
```

### Indexes Added

For query performance (tenant isolation + exclude deleted):

```sql
-- Individual column index
CREATE INDEX idx_{table}_deleted_at ON {table}(deleted_at);

-- Composite index for common query pattern
CREATE INDEX idx_{table}_tenant_deleted ON {table}(tenant_id, deleted_at);
```

## Query Patterns

### Default Behavior (Exclude Deleted)
```typescript
// Active records only
db.select()
  .from(requests)
  .where(
    and(
      eq(requests.tenantId, tenantId),
      isNull(requests.deletedAt)  // Exclude soft-deleted
    )
  );
```

### Admin Views (Include Deleted)
```typescript
// Optional parameter for including deleted
async function getRequests({
  tenantId,
  includeDeleted = false
}: GetRequestsParams) {
  const conditions = [eq(requests.tenantId, tenantId)];

  if (!includeDeleted) {
    conditions.push(isNull(requests.deletedAt));
  }

  return db.select()
    .from(requests)
    .where(and(...conditions));
}
```

### Recently Deleted View (Undo UI)
```typescript
// Show recently deleted items for undo
db.select()
  .from(requests)
  .where(
    and(
      eq(requests.tenantId, tenantId),
      isNotNull(requests.deletedAt),
      // Optional: Only show recent (last 24 hours)
      gte(requests.deletedAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
    )
  )
  .orderBy(desc(requests.deletedAt));
```

## Mutations

### Soft Delete
```typescript
async function deleteRequest(id: string, userId: string) {
  // Log to audit_logs first
  await db.insert(auditLogs).values({
    tenantId,
    userId,
    action: "request.deleted",
    entityType: "request",
    entityId: id,
    description: `Request ${requestNumber} soft deleted`,
    metadata: { deletedAt: new Date() }
  });

  // Perform soft delete
  await db.update(requests)
    .set({
      deletedAt: new Date(),
      deletedBy: userId
    })
    .where(eq(requests.id, id));
}
```

### Undo (Restore)
```typescript
async function undoDeleteRequest(id: string, userId: string) {
  // Log restoration
  await db.insert(auditLogs).values({
    tenantId,
    userId,
    action: "request.restored",
    entityType: "request",
    entityId: id,
    description: `Request ${requestNumber} restored`,
    metadata: { restoredAt: new Date() }
  });

  // Restore by clearing soft delete fields
  await db.update(requests)
    .set({
      deletedAt: null,
      deletedBy: null
    })
    .where(eq(requests.id, id));
}
```

### Permanent Deletion
```typescript
// Cleanup job (runs daily via BullMQ)
async function permanentlyDeleteOldRecords() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Delete from each table
  const tables = [requests, trials, budgets, users];

  for (const table of tables) {
    await db.delete(table)
      .where(
        and(
          isNotNull(table.deletedAt),
          lt(table.deletedAt, thirtyDaysAgo)
        )
      );
  }
}
```

## API Layer Changes

### tRPC Router Updates

Need to update these routers:

1. **`app/src/lib/api/routers/requests.ts`**
   - Add `includeDeleted` parameter to list queries
   - Update queries to filter `WHERE deleted_at IS NULL`
   - Add `deleteRequest()` mutation
   - Add `undoDeleteRequest()` mutation

2. **`app/src/lib/api/routers/trials.ts`** (if exists)
   - Same pattern as requests

3. **`app/src/lib/api/routers/budgets.ts`** (if exists)
   - Same pattern as requests

4. **`app/src/lib/api/routers/team.ts`**
   - Update user removal to use soft delete
   - Add undo mutation

### Example Router Changes

```typescript
// Before (hard delete)
delete: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.delete(requests)
      .where(eq(requests.id, input.id));
  }),

// After (soft delete)
delete: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.update(requests)
      .set({
        deletedAt: new Date(),
        deletedBy: ctx.session.user.id
      })
      .where(eq(requests.id, input.id));
  }),

// New undo mutation
undoDelete: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.update(requests)
      .set({
        deletedAt: null,
        deletedBy: null
      })
      .where(eq(requests.id, input.id));
  }),
```

## UI Integration

### Undo Toast Pattern
```typescript
import { toast } from 'sonner';

function handleDelete(id: string) {
  // Optimistic UI update
  const deleteMutation = api.requests.delete.useMutation({
    onSuccess: () => {
      toast.success('Request deleted', {
        action: {
          label: 'Undo',
          onClick: () => undoMutation.mutate({ id })
        },
        duration: 10000 // 10 second window
      });
    }
  });

  deleteMutation.mutate({ id });
}
```

### Recently Deleted View
- Add "Recently Deleted" tab/section to relevant pages
- Show items deleted in last 24-48 hours
- Provide bulk restore option
- Auto-hide after 30 days (when permanent deletion occurs)

## Performance Considerations

### Index Strategy
- All queries on affected tables MUST filter by `deleted_at`
- Composite indexes `(tenant_id, deleted_at)` support common pattern
- Individual `deleted_at` indexes for admin queries

### Query Performance
```sql
-- Efficient (uses composite index)
SELECT * FROM requests
WHERE tenant_id = 'abc' AND deleted_at IS NULL;

-- Efficient (uses deleted_at index)
SELECT * FROM requests
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT 50;
```

## Security Considerations

### Row Level Security (RLS)
Existing RLS policies automatically apply:
```sql
-- Existing policy continues to work
CREATE POLICY requests_tenant_isolation ON requests
  FOR ALL
  USING (tenant_id = app.current_tenant_id());
```

No RLS changes needed - soft deleted records remain tenant-isolated.

### Permissions
- **Delete permission**: Required to soft delete
- **Undo permission**: Same as delete (user can undo their own deletions)
- **Permanent deletion**: Admin-only (via cleanup job)
- **View deleted**: Admin/Manager roles only

## Audit Trail

All soft delete operations logged to `audit_logs`:

```typescript
{
  action: "request.deleted",
  entityType: "request",
  entityId: "uuid",
  userId: "uuid",
  metadata: {
    deletedAt: "2026-03-01T12:00:00Z",
    deletedBy: "uuid",
    requestNumber: "REQ-2026-0123"
  }
}

{
  action: "request.restored",
  entityType: "request",
  entityId: "uuid",
  userId: "uuid",
  metadata: {
    restoredAt: "2026-03-01T12:05:00Z",
    originalDeletedAt: "2026-03-01T12:00:00Z"
  }
}
```

## Future Enhancements

### Permanent Deletion Notifications
Before permanent deletion (30 days):
- Email notification to users: "These items will be permanently deleted in 3 days"
- In-app notification with restore option
- Export option for deleted data

### Bulk Operations
```typescript
// Bulk restore
undoDeleteMany: protectedProcedure
  .input(z.object({ ids: z.array(z.string().uuid()) }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.update(requests)
      .set({ deletedAt: null, deletedBy: null })
      .where(inArray(requests.id, input.ids));
  }),
```

### Analytics
- Track undo usage rates
- Identify patterns (which deletions are most often undone)
- Optimize undo window based on data

## Migration Execution

### Run Migration
```bash
# Using Drizzle Kit
cd app
npx drizzle-kit push:pg

# Or manually
psql -d reqflow_db -f src/lib/db/migrations/add-soft-delete-columns.sql
```

### Verify Migration
```sql
-- Check columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'requests'
AND column_name IN ('deleted_at', 'deleted_by');

-- Check indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename = 'requests'
AND indexname LIKE '%deleted%';
```

### Rollback (if needed)
```sql
-- Remove columns (destructive - loses soft delete data)
ALTER TABLE requests DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE requests DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE trials DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE trials DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE budgets DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE budgets DROP COLUMN IF EXISTS deleted_by;
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE users DROP COLUMN IF EXISTS deleted_by;

-- Drop indexes
DROP INDEX IF EXISTS idx_requests_deleted_at;
DROP INDEX IF EXISTS idx_requests_tenant_deleted;
DROP INDEX IF EXISTS idx_trials_deleted_at;
DROP INDEX IF EXISTS idx_trials_tenant_deleted;
DROP INDEX IF EXISTS idx_budgets_deleted_at;
DROP INDEX IF EXISTS idx_budgets_tenant_deleted;
DROP INDEX IF EXISTS idx_users_deleted_at;
DROP INDEX IF EXISTS idx_users_tenant_deleted;
```

## Testing Checklist

- [ ] Soft delete a draft request
- [ ] Verify request excluded from default queries
- [ ] Undo deletion within 10 seconds
- [ ] Verify request restored and visible
- [ ] Test with trial, budget, user tables
- [ ] Verify indexes used (EXPLAIN ANALYZE)
- [ ] Test RLS policies still work
- [ ] Verify audit logs created
- [ ] Test permanent deletion (30 day cleanup)
- [ ] Test bulk restore operations

## Summary

This implementation provides a robust soft delete system that:

1. ✅ Supports undo for 4 destructive actions (requests, trials, budgets, users)
2. ✅ Preserves data integrity with foreign key references
3. ✅ Maintains audit trail via `deleted_by` + `audit_logs`
4. ✅ Optimized query performance via composite indexes
5. ✅ Security via existing RLS policies
6. ✅ Clean API with `includeDeleted` parameter
7. ✅ 30-day retention before permanent deletion

**Next Steps:**
1. Run migration script
2. Update tRPC routers (requests, trials, budgets, team)
3. Add undo UI (toast notifications)
4. Implement cleanup job (BullMQ)
5. Add "Recently Deleted" views
