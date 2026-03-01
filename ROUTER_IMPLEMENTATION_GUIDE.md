# tRPC Router Implementation Guide for Soft Delete

This guide shows exactly how to update tRPC routers to support soft delete functionality.

## Core Pattern

### Before (Hard Delete)
```typescript
conditions.push(eq(requests.tenantId, ctx.tenantId));
```

### After (Soft Delete)
```typescript
import { isNull } from "drizzle-orm";

conditions.push(
  eq(requests.tenantId, ctx.tenantId),
  isNull(requests.deletedAt)  // Exclude soft-deleted
);
```

## 1. Update: app/src/lib/api/routers/requests.ts

### Add Imports
```typescript
import { isNull, isNotNull } from "drizzle-orm";
```

### Update All Query Procedures

#### stats
```typescript
stats: protectedProcedure.query(async ({ ctx }) => {
  const [myRequests] = await ctx.db
    .select({ count: count() })
    .from(requests)
    .where(
      and(
        eq(requests.tenantId, ctx.tenantId),
        eq(requests.requesterId, ctx.user.id),
        isNull(requests.deletedAt)  // ADD THIS
      )
    );

  const [myPending] = await ctx.db
    .select({ count: count() })
    .from(requests)
    .where(
      and(
        eq(requests.tenantId, ctx.tenantId),
        eq(requests.requesterId, ctx.user.id),
        eq(requests.status, "pending"),
        isNull(requests.deletedAt)  // ADD THIS
      )
    );

  const [approvedThisMonth] = await ctx.db
    .select({
      total: sql<string>`coalesce(sum(${requests.amount}), '0')`,
    })
    .from(requests)
    .where(
      and(
        eq(requests.tenantId, ctx.tenantId),
        eq(requests.status, "approved"),
        sql`${requests.approvedAt} >= date_trunc('month', now())`,
        isNull(requests.deletedAt)  // ADD THIS
      )
    );

  return {
    myRequests: myRequests.count,
    myPending: myPending.count,
    approvedThisMonth: parseFloat(approvedThisMonth.total),
  };
}),
```

#### myList (with optional includeDeleted)
```typescript
myList: protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(50),
      includeDeleted: z.boolean().default(false),  // ADD THIS
      search: z.string().optional(),
      status: z.enum(["draft", "pending", "approved", "rejected", "cancelled"]).optional(),
      // ... rest of input schema
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    const conditions = [
      eq(requests.tenantId, ctx.tenantId),
      eq(requests.requesterId, ctx.user.id),
    ];

    // Exclude deleted by default
    if (!input?.includeDeleted) {  // ADD THIS
      conditions.push(isNull(requests.deletedAt));
    }

    // ... rest of filters

    return ctx.db.select().from(requests).where(and(...conditions));
  }),
```

#### list (for admins - all requests)
```typescript
list: protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(50),
      includeDeleted: z.boolean().default(false),  // ADD THIS
      // ... rest of filters
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    const conditions = [eq(requests.tenantId, ctx.tenantId)];

    // Exclude deleted by default
    if (!input?.includeDeleted) {  // ADD THIS
      conditions.push(isNull(requests.deletedAt));
    }

    // ... rest of implementation
  }),
```

#### byId
```typescript
byId: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    const request = await ctx.db.query.requests.findFirst({
      where: and(
        eq(requests.id, input.id),
        eq(requests.tenantId, ctx.tenantId),
        // Note: Allow viewing deleted requests (for undo UI)
        // OR explicitly exclude: isNull(requests.deletedAt)
      ),
      // ... rest of query
    });

    if (!request) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return request;
  }),
```

### Add New Procedures

#### delete (soft delete)
```typescript
delete: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Check ownership
    const request = await ctx.db.query.requests.findFirst({
      where: and(
        eq(requests.id, input.id),
        eq(requests.tenantId, ctx.tenantId)
      ),
    });

    if (!request) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Only allow deleting draft requests
    if (request.status !== "draft") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only draft requests can be deleted",
      });
    }

    // Verify requester owns this request (or is admin)
    if (request.requesterId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Soft delete
    await ctx.db
      .update(requests)
      .set({
        deletedAt: new Date(),
        deletedBy: ctx.user.id,
      })
      .where(eq(requests.id, input.id));

    // Audit log
    await createAuditLog(ctx.db, {
      tenantId: ctx.tenantId,
      userId: ctx.user.id,
      userEmail: ctx.user.email,
      userName: ctx.user.name,
      action: AuditAction.REQUEST_DELETED,
      entityType: "request",
      entityId: request.id,
      description: `Request ${request.requestNumber} soft deleted`,
      metadata: {
        requestNumber: request.requestNumber,
        title: request.title,
        deletedAt: new Date(),
      },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { success: true };
  }),
```

#### undoDelete (restore)
```typescript
undoDelete: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Find deleted request
    const request = await ctx.db.query.requests.findFirst({
      where: and(
        eq(requests.id, input.id),
        eq(requests.tenantId, ctx.tenantId),
        isNotNull(requests.deletedAt)  // Must be deleted
      ),
    });

    if (!request) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Deleted request not found",
      });
    }

    // Verify permission (original requester or admin)
    if (request.requesterId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Restore
    await ctx.db
      .update(requests)
      .set({
        deletedAt: null,
        deletedBy: null,
      })
      .where(eq(requests.id, input.id));

    // Audit log
    await createAuditLog(ctx.db, {
      tenantId: ctx.tenantId,
      userId: ctx.user.id,
      userEmail: ctx.user.email,
      userName: ctx.user.name,
      action: AuditAction.REQUEST_RESTORED,
      entityType: "request",
      entityId: request.id,
      description: `Request ${request.requestNumber} restored`,
      metadata: {
        requestNumber: request.requestNumber,
        title: request.title,
        restoredAt: new Date(),
        originalDeletedAt: request.deletedAt,
      },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { success: true };
  }),
```

#### recentlyDeleted (for undo UI)
```typescript
recentlyDeleted: protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(50).default(20),
      hoursAgo: z.number().min(1).max(168).default(24), // 1 hour to 7 days
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    const hoursAgo = input?.hoursAgo ?? 24;
    const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    return ctx.db
      .select()
      .from(requests)
      .where(
        and(
          eq(requests.tenantId, ctx.tenantId),
          eq(requests.requesterId, ctx.user.id),  // Only user's own deleted requests
          isNotNull(requests.deletedAt),
          gte(requests.deletedAt, cutoff)
        )
      )
      .orderBy(desc(requests.deletedAt))
      .limit(input?.limit ?? 20);
  }),
```

## 2. Update: app/src/lib/api/routers/team.ts

### Remove Team Member (soft delete)

```typescript
import { isNull, isNotNull } from "drizzle-orm";
import { users } from "../../db/schema";

removeMember: protectedProcedure
  .input(z.object({ userId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Only admins can remove team members
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Verify user exists and belongs to tenant
    const user = await ctx.db.query.users.findFirst({
      where: and(
        eq(users.id, input.userId),
        eq(users.tenantId, ctx.tenantId),
        isNull(users.deletedAt)  // Not already deleted
      ),
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Can't delete yourself
    if (user.id === ctx.user.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot remove yourself",
      });
    }

    // Soft delete
    await ctx.db
      .update(users)
      .set({
        deletedAt: new Date(),
        deletedBy: ctx.user.id,
        isActive: false,  // Also deactivate
      })
      .where(eq(users.id, input.userId));

    // Audit log
    await createAuditLog(ctx.db, {
      tenantId: ctx.tenantId,
      userId: ctx.user.id,
      userEmail: ctx.user.email,
      userName: ctx.user.name,
      action: AuditAction.USER_DELETED,
      entityType: "user",
      entityId: user.id,
      description: `Team member ${user.name} removed`,
      metadata: {
        removedUserEmail: user.email,
        removedUserName: user.name,
        deletedAt: new Date(),
      },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { success: true };
  }),

restoreMember: protectedProcedure
  .input(z.object({ userId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Only admins can restore team members
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Find deleted user
    const user = await ctx.db.query.users.findFirst({
      where: and(
        eq(users.id, input.userId),
        eq(users.tenantId, ctx.tenantId),
        isNotNull(users.deletedAt)  // Must be deleted
      ),
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Deleted user not found",
      });
    }

    // Restore
    await ctx.db
      .update(users)
      .set({
        deletedAt: null,
        deletedBy: null,
        isActive: true,  // Reactivate
      })
      .where(eq(users.id, input.userId));

    // Audit log
    await createAuditLog(ctx.db, {
      tenantId: ctx.tenantId,
      userId: ctx.user.id,
      userEmail: ctx.user.email,
      userName: ctx.user.name,
      action: AuditAction.USER_RESTORED,
      entityType: "user",
      entityId: user.id,
      description: `Team member ${user.name} restored`,
      metadata: {
        restoredUserEmail: user.email,
        restoredUserName: user.name,
        restoredAt: new Date(),
        originalDeletedAt: user.deletedAt,
      },
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { success: true };
  }),

// Update list to exclude deleted
list: protectedProcedure
  .input(
    z.object({
      includeDeleted: z.boolean().default(false),  // ADD THIS
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    const conditions = [eq(users.tenantId, ctx.tenantId)];

    // Exclude deleted by default
    if (!input?.includeDeleted) {
      conditions.push(isNull(users.deletedAt));
    }

    return ctx.db
      .select()
      .from(users)
      .where(and(...conditions))
      .orderBy(asc(users.name));
  }),
```

## 3. Add Audit Actions

Update `app/src/lib/monitoring/audit.ts`:

```typescript
export enum AuditAction {
  // ... existing actions

  // Soft delete actions
  REQUEST_DELETED = "request.deleted",
  REQUEST_RESTORED = "request.restored",
  TRIAL_DELETED = "trial.deleted",
  TRIAL_RESTORED = "trial.restored",
  BUDGET_DELETED = "budget.deleted",
  BUDGET_RESTORED = "budget.restored",
  USER_DELETED = "user.deleted",
  USER_RESTORED = "user.restored",
}
```

## 4. Frontend Integration

### tRPC Hook Usage

```typescript
import { api } from "@/lib/api/trpc";
import { toast } from "sonner";

function RequestsList() {
  // Query with soft delete filter
  const { data: requests } = api.requests.myList.useQuery({
    includeDeleted: false,  // Default: hide deleted
  });

  // Mutation hooks
  const deleteMutation = api.requests.delete.useMutation();
  const undoMutation = api.requests.undoDelete.useMutation();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Request deleted", {
            action: {
              label: "Undo",
              onClick: () => handleUndo(id),
            },
            duration: 10000, // 10 second undo window
          });
        },
      }
    );
  };

  const handleUndo = (id: string) => {
    undoMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Request restored");
        },
      }
    );
  };

  return (
    <div>
      {requests?.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onDelete={() => handleDelete(request.id)}
        />
      ))}
    </div>
  );
}
```

### Recently Deleted View

```typescript
function RecentlyDeletedView() {
  const { data: deleted } = api.requests.recentlyDeleted.useQuery({
    limit: 20,
    hoursAgo: 24,
  });

  const undoMutation = api.requests.undoDelete.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh lists
      api.useUtils().requests.invalidate();
    },
  });

  if (!deleted?.length) {
    return <EmptyState message="No recently deleted requests" />;
  }

  return (
    <div>
      <h2>Recently Deleted (last 24 hours)</h2>
      {deleted.map((request) => (
        <Card key={request.id}>
          <div className="flex justify-between">
            <div>
              <p className="font-medium text-slate-400 line-through">
                {request.title}
              </p>
              <p className="text-sm text-slate-500">
                Deleted {formatDistanceToNow(request.deletedAt!)} ago
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => undoMutation.mutate({ id: request.id })}
            >
              Restore
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

## 5. Testing

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { createTestContext } from "@/lib/api/test-utils";

describe("requests.delete", () => {
  it("should soft delete a draft request", async () => {
    const ctx = await createTestContext();
    const request = await ctx.createRequest({ status: "draft" });

    await ctx.caller.requests.delete({ id: request.id });

    const deleted = await ctx.db.query.requests.findFirst({
      where: eq(requests.id, request.id),
    });

    expect(deleted?.deletedAt).toBeTruthy();
    expect(deleted?.deletedBy).toBe(ctx.user.id);
  });

  it("should not allow deleting non-draft requests", async () => {
    const ctx = await createTestContext();
    const request = await ctx.createRequest({ status: "pending" });

    await expect(
      ctx.caller.requests.delete({ id: request.id })
    ).rejects.toThrow("Only draft requests can be deleted");
  });
});

describe("requests.undoDelete", () => {
  it("should restore a deleted request", async () => {
    const ctx = await createTestContext();
    const request = await ctx.createRequest({ status: "draft" });

    await ctx.caller.requests.delete({ id: request.id });
    await ctx.caller.requests.undoDelete({ id: request.id });

    const restored = await ctx.db.query.requests.findFirst({
      where: eq(requests.id, request.id),
    });

    expect(restored?.deletedAt).toBeNull();
    expect(restored?.deletedBy).toBeNull();
  });
});
```

## Summary

This implementation guide provides:

1. ✅ Exact code updates for all tRPC routers
2. ✅ New procedures: `delete`, `undoDelete`, `recentlyDeleted`
3. ✅ Updated queries to exclude soft-deleted records
4. ✅ Optional `includeDeleted` parameter for admin views
5. ✅ Audit logging for all soft delete operations
6. ✅ Frontend integration examples with toast undo
7. ✅ Unit test examples

**Next Steps:**
1. Apply these changes to routers
2. Update frontend components
3. Add unit/integration tests
4. Deploy to staging for QA
