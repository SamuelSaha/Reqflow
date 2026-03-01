-- ============================================================================
-- SOFT DELETE MIGRATION
-- Version: 1.0.0
-- Date: 2026-03-01
-- Description: Adds soft delete support for undo functionality (Issue #81)
-- ============================================================================
--
-- OVERVIEW:
-- Enables soft delete for 4 destructive actions:
--   1. Delete draft requests
--   2. Cancel trials
--   3. Delete budgets
--   4. Remove team members (users)
--
-- DESIGN DECISIONS:
--   - approvals table does NOT get soft delete (uses `decision` field instead)
--   - deleted_at: timestamp when deleted (NULL = not deleted)
--   - deleted_by: user who performed deletion (for audit trail)
--   - Queries exclude deleted by default: WHERE deleted_at IS NULL
--   - Undo: UPDATE table SET deleted_at = NULL, deleted_by = NULL WHERE id = ?
--   - Permanent deletion: Cleanup job after 30 days (separate implementation)
--
-- PERFORMANCE:
--   - Indexes on (tenant_id, deleted_at) for efficient filtering
--   - Composite indexes support common query pattern: tenant isolation + exclude deleted
-- ============================================================================

-- ============================================================================
-- 1. REQUESTS TABLE
-- ============================================================================
-- Use case: Delete draft requests before submission
-- Example: User creates draft, changes mind, deletes it, then undos

ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_requests_deleted_at
  ON requests(deleted_at);

CREATE INDEX IF NOT EXISTS idx_requests_tenant_deleted
  ON requests(tenant_id, deleted_at);

COMMENT ON COLUMN requests.deleted_at IS 'Soft delete timestamp for undo functionality. NULL = active, NOT NULL = deleted';
COMMENT ON COLUMN requests.deleted_by IS 'User who deleted this request (for audit trail)';

-- ============================================================================
-- 2. TRIALS TABLE
-- ============================================================================
-- Use case: Cancel trial tracking (distinct from status="cancelled")
-- Note: status field still tracks workflow state, deleted_at tracks deletion

ALTER TABLE trials
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

CREATE INDEX IF NOT EXISTS idx_trials_deleted_at
  ON trials(deleted_at);

CREATE INDEX IF NOT EXISTS idx_trials_tenant_deleted
  ON trials(tenant_id, deleted_at);

COMMENT ON COLUMN trials.deleted_at IS 'Soft delete timestamp for undo functionality. NULL = active, NOT NULL = deleted';
COMMENT ON COLUMN trials.deleted_by IS 'User ID who deleted this trial (for audit trail)';

-- ============================================================================
-- 3. BUDGETS TABLE
-- ============================================================================
-- Use case: Delete budget allocations (e.g., project budget no longer needed)
-- Important: Requests referencing deleted budgets will have budget_id set to NULL

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_budgets_deleted_at
  ON budgets(deleted_at);

CREATE INDEX IF NOT EXISTS idx_budgets_tenant_deleted
  ON budgets(tenant_id, deleted_at);

COMMENT ON COLUMN budgets.deleted_at IS 'Soft delete timestamp for undo functionality. NULL = active, NOT NULL = deleted';
COMMENT ON COLUMN budgets.deleted_by IS 'User who deleted this budget (for audit trail)';

-- ============================================================================
-- 4. USERS TABLE
-- ============================================================================
-- Use case: Remove team members (distinct from is_active flag)
-- Note: is_active is for disable/enable, deleted_at is for actual removal
-- Important: Preserves user data for audit trail and foreign key integrity

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at
  ON users(deleted_at);

CREATE INDEX IF NOT EXISTS idx_users_tenant_deleted
  ON users(tenant_id, deleted_at);

COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp for undo functionality. NULL = active, NOT NULL = removed from team';
COMMENT ON COLUMN users.deleted_by IS 'User who removed this team member (for audit trail)';

-- ============================================================================
-- AUDIT LOG INTEGRATION
-- ============================================================================
-- Recommendation: Log soft delete actions to audit_logs table
-- Example audit log entries:
--   action: "request.deleted", "trial.deleted", "budget.deleted", "user.deleted"
--   action: "request.restored", "trial.restored", "budget.restored", "user.restored"
--   metadata: { deleted_at: timestamp, deleted_by: userId }
-- ============================================================================

-- ============================================================================
-- QUERY PATTERNS
-- ============================================================================
-- Active records only (default behavior):
--   SELECT * FROM requests WHERE tenant_id = ? AND deleted_at IS NULL;
--
-- Include deleted (admin views, undo UI):
--   SELECT * FROM requests WHERE tenant_id = ?;
--
-- Deleted only (recently deleted view):
--   SELECT * FROM requests WHERE tenant_id = ? AND deleted_at IS NOT NULL;
--
-- Undo operation:
--   UPDATE requests SET deleted_at = NULL, deleted_by = NULL WHERE id = ?;
--
-- Soft delete:
--   UPDATE requests SET deleted_at = NOW(), deleted_by = ? WHERE id = ?;
-- ============================================================================

-- ============================================================================
-- CLEANUP STRATEGY (Future Implementation)
-- ============================================================================
-- Permanent deletion after 30 days:
--   DELETE FROM requests WHERE deleted_at < NOW() - INTERVAL '30 days';
--
-- Recommended: Run as scheduled job (e.g., daily cron, BullMQ job)
-- Consider: Add notification before permanent deletion
-- Consider: Export deleted data before permanent deletion
-- ============================================================================
