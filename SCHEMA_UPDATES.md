# Drizzle Schema Updates for Soft Delete

After running the SQL migration, update these Drizzle schema files to match:

## 1. requests.ts

```typescript
// Add to imports
import { users } from "./users";

// Add to table definition (after rejectedAt)
export const requests = pgTable(
  "requests",
  {
    // ... existing fields ...
    rejectedAt: timestamp("rejected_at"),

    // Soft delete support
    deletedAt: timestamp("deleted_at"),
    deletedBy: uuid("deleted_by").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [
    // ... existing indexes ...
    index("requests_deleted_idx").on(table.deletedAt),
    index("requests_tenant_deleted_idx").on(table.tenantId, table.deletedAt),
  ]
);

// Update Zod schema (optional - for validation)
export const insertRequestSchema = createInsertSchema(requests, {
  // ... existing validations ...
  deletedAt: z.date().optional(),
  deletedBy: z.string().uuid().optional(),
});
```

## 2. trials.ts

```typescript
// Add to table definition (after updatedAt)
export const trials = pgTable("trials", {
  // ... existing fields ...
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // Soft delete support
  deletedAt: timestamp("deleted_at"),
  deletedBy: uuid("deleted_by"), // Note: No FK constraint (initiatedById is not FK)
}, (table) => [
  // ... existing indexes ...
  index("trials_deleted_idx").on(table.deletedAt),
  index("trials_tenant_deleted_idx").on(table.tenantId, table.deletedAt),
]);
```

## 3. budgets.ts

```typescript
// Add to imports (if not already there)
import { users } from "./users";

// Add to table definition (after updatedAt)
export const budgets = pgTable(
  "budgets",
  {
    // ... existing fields ...
    updatedAt: timestamp("updated_at").notNull().defaultNow(),

    // Soft delete support
    deletedAt: timestamp("deleted_at"),
    deletedBy: uuid("deleted_by").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [
    // ... existing indexes ...
    index("budgets_deleted_idx").on(table.deletedAt),
    index("budgets_tenant_deleted_idx").on(table.tenantId, table.deletedAt),
  ]
);
```

## 4. users.ts

```typescript
// Add to table definition (after lastLoginAt)
export const users = pgTable(
  "users",
  {
    // ... existing fields ...
    lastLoginAt: timestamp("last_login_at"),

    // Soft delete support
    deletedAt: timestamp("deleted_at"),
    deletedBy: uuid("deleted_by").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [
    // ... existing indexes ...
    index("users_deleted_idx").on(table.deletedAt),
    index("users_tenant_deleted_idx").on(table.tenantId, table.deletedAt),
  ]
);
```

## Type Updates

After updating schema files, the TypeScript types will automatically update:

```typescript
// Before
type Request = {
  id: string;
  // ... other fields
  rejectedAt: Date | null;
}

// After
type Request = {
  id: string;
  // ... other fields
  rejectedAt: Date | null;
  deletedAt: Date | null;        // NEW
  deletedBy: string | null;      // NEW
}
```

## Verification

After updating schema files:

```bash
cd app

# Generate types
npx drizzle-kit generate:pg

# Verify no drift between DB and schema
npx drizzle-kit check:pg

# Should output: "No schema changes detected"
```

## Query Helper Functions

Add these utility functions to filter deleted records:

```typescript
// app/src/lib/db/utils.ts
import { SQL, isNull, and } from "drizzle-orm";

/**
 * Exclude soft-deleted records from query
 */
export function excludeDeleted<T extends { deletedAt: any }>(
  table: T
): SQL {
  return isNull(table.deletedAt);
}

/**
 * Build query conditions with optional includeDeleted
 */
export function withDeletedFilter<T extends { deletedAt: any }>(
  table: T,
  includeDeleted: boolean = false
): SQL[] {
  return includeDeleted ? [] : [excludeDeleted(table)];
}

// Usage in queries
import { excludeDeleted, withDeletedFilter } from "@/lib/db/utils";

// Simple usage
db.select()
  .from(requests)
  .where(
    and(
      eq(requests.tenantId, tenantId),
      excludeDeleted(requests)  // Filter out deleted
    )
  );

// With optional parameter
function getRequests({ tenantId, includeDeleted = false }) {
  return db.select()
    .from(requests)
    .where(
      and(
        eq(requests.tenantId, tenantId),
        ...withDeletedFilter(requests, includeDeleted)
      )
    );
}
```

## Migration Workflow

1. **Run SQL migration first** (updates database schema)
   ```bash
   psql -d reqflow_db -f app/src/lib/db/migrations/add-soft-delete-columns.sql
   ```

2. **Update Drizzle schema files** (updates TypeScript types)
   - Edit `requests.ts`, `trials.ts`, `budgets.ts`, `users.ts`
   - Add `deletedAt` and `deletedBy` columns
   - Add indexes

3. **Verify no drift**
   ```bash
   npx drizzle-kit check:pg
   ```

4. **Update queries** in tRPC routers
   - Add `excludeDeleted()` to WHERE clauses
   - Add `includeDeleted` parameter where needed

5. **Update mutations**
   - Change DELETE to UPDATE (soft delete)
   - Add undo mutations

6. **Test thoroughly**
   - Unit tests for mutations
   - Integration tests for queries
   - E2E tests for UI flows
