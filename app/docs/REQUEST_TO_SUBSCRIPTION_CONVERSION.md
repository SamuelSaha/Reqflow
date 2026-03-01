# Request-to-Subscription Conversion Feature

## Overview
Implements the request-to-subscription conversion workflow (#93) - a P0 Critical MVP feature that enables converting approved purchase requests into tracked subscriptions, establishing the "connected record" flow for spend analytics on recurring costs.

## Implementation Summary

### 1. Database Schema Changes ✅
**Files Modified:**
- `app/src/lib/db/schema/requests.ts`
  - Added `convertedToSubscriptionId` field (UUID, nullable, references subscriptions)
  - Added Drizzle relation `convertedToSubscription`
- `app/src/lib/db/schema/subscriptions.ts`
  - Added `sourceRequestId` field (UUID, nullable, references requests)
  - Added Drizzle relation `sourceRequest`

**Migration:**
Schema changes will be auto-generated via `npm run db:generate`

### 2. Backend API Endpoint ✅
**File Created:** `app/src/lib/api/routers/subscriptions.ts`

**Endpoints:**
1. `subscriptions.createFromRequest` (mutation)
   - Validates request is approved, recurring, and has a vendor
   - Prevents double-conversion
   - Creates subscription with pre-filled data:
     - `toolName` ← `request.title`
     - `totalCost` ← `request.amount`
     - `billingCycle` ← `request.frequency` (monthly/annually)
     - `vendorId`, `departmentId`, `requestedById` mapped directly
   - Atomically updates both records (bidirectional link)

2. `subscriptions.getById` (query)
   - Fetches subscription by ID
   - Validates tenant access

**File Modified:** `app/src/lib/api/root.ts`
- Registered subscriptions router in app router

### 3. Frontend UI Components ✅
**File Created:** `app/src/components/dashboard/ConvertToSubscriptionDialog.tsx`
- Modal dialog for conversion confirmation
- Shows preview of subscription to be created
- Handles conversion mutation with loading states and error handling
- Refreshes request data after successful conversion

**File Modified:** `app/src/app/dashboard/requests/[id]/page.tsx`
- Added "Convert to Subscription" card (sidebar)
  - Shows for: approved + recurring + not yet converted requests
  - Opens conversion dialog
- Added "Subscription" card (sidebar)
  - Shows when request has been converted
  - Displays success message
  - Links to subscription detail page (when available)

## Testing Checklist

### Prerequisites
- [ ] Database is running and accessible
- [ ] Environment variables are configured in `.env.local`
- [ ] Run `npm run db:generate` to create migration
- [ ] Run `npm run db:migrate` to apply migration
- [ ] Verify columns exist:
  ```sql
  \d requests -- should show converted_to_subscription_id
  \d subscriptions -- should show source_request_id
  ```

### Manual Testing Steps

#### Happy Path
1. [ ] Create a new request with:
   - Frequency: "monthly" or "annually" (not "one-time")
   - Vendor: Select any vendor
   - Submit and approve the request
2. [ ] Navigate to request detail page
3. [ ] Verify "Convert to Subscription" card appears in sidebar
4. [ ] Click "Convert to Subscription" button
5. [ ] Verify dialog opens with correct preview data
6. [ ] Click "Convert to Subscription" in dialog
7. [ ] Verify:
   - Success toast appears
   - Dialog closes
   - "Subscription" card replaces "Convert to Subscription" card
   - "View Subscription" link is present (will 404 until subscription pages are built)
8. [ ] Check database:
   ```sql
   SELECT id, converted_to_subscription_id FROM requests WHERE id = '<request-id>';
   SELECT id, source_request_id FROM subscriptions WHERE source_request_id = '<request-id>';
   ```
   Both should show the linked IDs

#### Error Cases
1. [ ] Try converting one-time request → Should not show button
2. [ ] Try converting draft request → Should not show button
3. [ ] Try converting already-converted request → Should not show button, should show subscription link instead
4. [ ] Try converting request without vendor → Should show validation error

### API Testing (Optional)
```typescript
// Using tRPC client
const subscription = await trpc.subscriptions.createFromRequest.mutate({
  requestId: '<approved-recurring-request-id>'
});

// Should return subscription object with:
// - subscription.sourceRequestId === requestId
// - subscription.toolName === request.title
// - subscription.totalCost === request.amount
// - subscription.billingCycle matches request.frequency
```

## Known Limitations

1. **No Subscription Pages**: The subscription detail pages don't exist yet
   - Conversion works, but "View Subscription" link will 404
   - TODO: Remove routing redirect in `ConvertToSubscriptionDialog.tsx` once pages are built

2. **No Reverse Conversion**: Once converted, cannot unconvert
   - Future enhancement: Add "Remove subscription link" feature

3. **No Bulk Conversion**: Can only convert one request at a time
   - Future enhancement: Add bulk conversion action in requests list

## Files Changed Summary
```
Modified:
  app/src/lib/db/schema/requests.ts
  app/src/lib/db/schema/subscriptions.ts
  app/src/lib/api/root.ts
  app/src/app/dashboard/requests/[id]/page.tsx

Created:
  app/src/lib/api/routers/subscriptions.ts
  app/src/components/dashboard/ConvertToSubscriptionDialog.tsx
  app/docs/REQUEST_TO_SUBSCRIPTION_CONVERSION.md
```

## Next Steps

1. Run database migration in environment with DATABASE_URL configured:
   ```bash
   cd app
   npm run db:generate  # Generate migration from schema changes
   npm run db:migrate   # Apply migration to database
   ```

2. Test the conversion workflow using the testing checklist above

3. Future enhancements:
   - Build subscription detail pages (`/dashboard/subscriptions/[id]`)
   - Add subscription list page (`/dashboard/subscriptions`)
   - Enable navigation after conversion
   - Add bulk conversion feature
   - Add reverse conversion (unlink) feature
