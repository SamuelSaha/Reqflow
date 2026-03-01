# Notification Center Implementation

This document describes the implementation of the in-app notification center for Reqflow (Issue #94).

## Overview

The notification center provides real-time in-app notifications for users, complementing the existing email and Slack notifications. Users receive instant notifications for approvals, request decisions, budget warnings, trial expirations, and renewal reminders.

## Architecture

### Database Schema

**New Table: `notifications`**
- `id` (UUID, primary key)
- `tenant_id` (UUID, foreign key to organizations)
- `user_id` (UUID, foreign key to users)
- `type` (text) - notification type (e.g., "approval_assigned", "request_approved")
- `title` (text) - notification title
- `message` (text) - notification body text
- `action_url` (text, nullable) - deep link to related resource
- `read` (boolean, default false)
- `read_at` (timestamp, nullable)
- `created_at` (timestamp, default now)

**Indexes:**
- `notifications_tenant_idx` on `tenant_id`
- `notifications_user_idx` on `user_id`
- `notifications_read_idx` on `read`
- `notifications_created_idx` on `created_at`
- `notifications_user_unread_idx` on `(user_id, read)` - composite for efficient unread queries

**Updated Table: `users`**
- Added `notification_preferences` (JSONB) - stores per-notification-type channel preferences

### Backend Implementation

#### tRPC Router: `/app/src/lib/api/routers/notifications.ts`

**Endpoints:**
- `list` - List notifications with pagination and filtering
- `getUnreadCount` - Get count of unread notifications (for badge)
- `markAsRead` - Mark a single notification as read
- `markAllAsRead` - Mark all notifications as read
- `delete` - Delete a notification
- `getPreferences` - Get user's notification preferences
- `updatePreferences` - Update notification preferences
- `onNew` (subscription) - Real-time notification stream using tRPC subscriptions

**Real-time Delivery:**
Uses Node.js EventEmitter + tRPC subscriptions for real-time push notifications:
1. When a notification is created, `createNotification()` emits an event
2. Subscribed clients receive the notification instantly via WebSocket
3. Fallback polling every 30 seconds for reliability

**Helper Functions:**
- `createNotification()` - Exported helper for other routers to create notifications
- `emitNotification()` - Broadcasts notification to subscribed clients

#### Integration Points

**Approval Decisions** (`/app/src/lib/api/routers/approvals.ts`):
- When an approval is approved/rejected, creates notification for requester
- Shows approval status and links to request details

**Approval Assignment** (`/app/src/lib/workflows/approval-router.ts`):
- When an approval is created, notifies the assigned approver
- Includes request title, amount, and link to approvals queue

### Frontend Implementation

#### Components

**`NotificationBell.tsx`** - Navbar bell icon
- Shows unread count badge
- Opens dropdown with recent notifications
- Subscribes to real-time updates via `trpc.notifications.onNew.useSubscription()`
- Polls every 30 seconds as fallback

**`NotificationList.tsx`** - Notification list component
- Displays notifications with read/unread styling
- Mark as read on click
- Delete button (visible on hover)
- "Mark all as read" action
- Shows time ago (e.g., "2 hours ago")
- Deep links to action URLs

**Pages:**

**`/app/src/app/dashboard/notifications/page.tsx`**
- Full notification history
- Filter by all/unread
- Pagination support

**`/app/src/app/dashboard/settings/notifications/page.tsx`**
- Notification preferences UI
- Table with notification types × channels (Email, In-App, Slack)
- Toggle switches for each preference
- Save changes button

#### Dashboard Integration

Updated `/app/src/app/dashboard/layout.tsx`:
- Added `NotificationBell` component to navbar
- Positioned between navigation and mobile menu

### Notification Types

Defined in `/app/src/lib/db/schema/notifications.ts`:

```typescript
export const NotificationType = {
  // Approvals
  APPROVAL_ASSIGNED: "approval_assigned",
  APPROVAL_REMINDER: "approval_reminder",

  // Requests
  REQUEST_APPROVED: "request_approved",
  REQUEST_REJECTED: "request_rejected",
  REQUEST_NEEDS_INFO: "request_needs_info",

  // Budgets
  BUDGET_WARNING: "budget_warning",
  BUDGET_EXCEEDED: "budget_exceeded",

  // Trials
  TRIAL_EXPIRING: "trial_expiring",
  TRIAL_EXPIRED: "trial_expired",
  TRIAL_DECISION_NEEDED: "trial_decision_needed",

  // Renewals
  RENEWAL_DUE: "renewal_due",
  RENEWAL_UPCOMING: "renewal_upcoming",
  RENEWAL_DECISION_NEEDED: "renewal_decision_needed",

  // System
  SYSTEM_ANNOUNCEMENT: "system_announcement",
  INTEGRATION_ERROR: "integration_error",
}
```

## Migration Steps

1. **Run database migration:**
   ```bash
   cd app
   npm run db:generate
   npm run db:migrate
   # Or manually run: app/src/lib/db/migrations/add-notifications.sql
   ```

2. **Verify schema:**
   ```bash
   npm run db:studio
   ```
   Check that `notifications` table exists and `users.notification_preferences` field is added.

3. **Test real-time notifications:**
   - Open browser DevTools → Network → WS (WebSocket)
   - Create an approval or request decision
   - Verify WebSocket message received
   - Check bell badge updates instantly

4. **Test preferences:**
   - Visit `/dashboard/settings/notifications`
   - Toggle preferences
   - Create a notification
   - Verify it respects the preference settings

## Usage Examples

### Creating a Notification from Any Router

```typescript
import { createNotification } from "@/lib/api/routers/notifications";

// In any tRPC mutation
await createNotification(ctx.db, {
  tenantId: ctx.tenantId,
  userId: targetUserId,
  type: "budget_warning",
  title: "Budget Running Low",
  message: `Your Marketing budget has only $500 remaining.`,
  actionUrl: `/dashboard/budgets/${budgetId}`,
});
```

The notification will:
1. Check user's preferences for "budget_warning" type
2. Only create in-app notification if `inApp: true` (default)
3. Save to database
4. Emit real-time event to subscribed clients
5. Appear instantly in user's notification bell

### Subscribing to Real-time Notifications

```typescript
// In a React component
trpc.notifications.onNew.useSubscription(undefined, {
  onData: (notification) => {
    // New notification received
    toast.info(notification.title);
    refetchUnreadCount();
  },
});
```

## Files Created/Modified

### Created Files:
- `/app/src/lib/db/schema/notifications.ts` - Notification schema
- `/app/src/lib/api/routers/notifications.ts` - Notifications tRPC router
- `/app/src/components/notifications/NotificationBell.tsx` - Bell icon component
- `/app/src/components/notifications/NotificationList.tsx` - Notification list component
- `/app/src/app/dashboard/notifications/page.tsx` - Full notifications page
- `/app/src/app/dashboard/settings/notifications/page.tsx` - Preferences page
- `/app/src/lib/db/migrations/add-notifications.sql` - Database migration

### Modified Files:
- `/app/src/lib/db/schema/users.ts` - Added `notificationPreferences` field
- `/app/src/lib/db/schema/index.ts` - Export notifications schema
- `/app/src/lib/api/root.ts` - Register notifications router
- `/app/src/lib/api/routers/approvals.ts` - Create notifications on decisions
- `/app/src/lib/workflows/approval-router.ts` - Create notifications on assignment
- `/app/src/app/dashboard/layout.tsx` - Add NotificationBell to navbar
- `/app/src/lib/monitoring/audit.ts` - Add NOTIFICATION_READ audit action

## Acceptance Criteria ✅

- [x] **Bell icon shows unread count** - Badge displays count, updates in real-time
- [x] **Notifications delivered in real-time** - WebSocket subscription + EventEmitter
- [x] **Clicking notification marks as read and navigates** - `markAsRead` + `actionUrl` navigation
- [x] **Full notification history page** - `/dashboard/notifications` with filters
- [x] **Notification preferences UI** - `/dashboard/settings/notifications` with toggles per type/channel

## Performance Considerations

- **Database indexes** ensure fast queries even with 100k+ notifications
- **Composite index** on `(user_id, read)` optimizes unread count queries
- **Real-time via subscriptions** avoids polling overhead
- **Fallback polling** every 30s ensures reliability if WebSocket drops
- **Pagination** prevents loading too many notifications at once

## Security

- **Row-level security** - All queries filtered by `tenantId` and `userId`
- **CSRF protection** - Mutations require valid CSRF token
- **Rate limiting** - Standard tRPC rate limits apply (100 queries/min, 20 mutations/min)
- **Audit logging** - Mark all read actions logged to `audit_logs`

## Future Enhancements

1. **Notification grouping** - Group similar notifications (e.g., "5 new approvals")
2. **Notification batching** - Batch notifications to avoid spam
3. **Custom notification sounds** - Per-type notification sounds
4. **Email digest** - Daily/weekly email summary of notifications
5. **Push notifications** - Browser push notifications when tab not active
6. **Notification templates** - Rich HTML templates for notifications
7. **Notification actions** - Quick actions (Approve/Reject) directly from notification

## Testing Checklist

- [ ] Create approval → approver receives notification instantly
- [ ] Approve request → requester receives notification
- [ ] Reject request → requester receives notification
- [ ] Click notification → marks as read, navigates to URL
- [ ] Unread count updates in real-time
- [ ] "Mark all as read" works
- [ ] Delete notification works
- [ ] Preferences save correctly
- [ ] Disabling in-app notifications prevents creation
- [ ] WebSocket reconnects after disconnect
- [ ] Fallback polling works when WebSocket unavailable
- [ ] Works on mobile viewport
