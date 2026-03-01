-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) MIGRATION FOR REQFLOW
-- Version: 1.0.0
-- Date: 2026-02-27
-- Description: Implements tenant isolation at the database level
-- ============================================================================

-- SECURITY MODEL:
-- 1. Session variable 'app.current_tenant' contains the user's tenant_id
-- 2. Session variable 'app.current_user_id' contains the user's id
-- 3. Session variable 'app.current_user_role' contains the user's role
-- 4. All queries are automatically filtered by tenant_id
-- 5. Role-based policies provide additional access control

-- ============================================================================
-- STEP 1: Create helper functions for session variables
-- ============================================================================

-- Function to get current tenant ID from session
CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_tenant', true), '')::uuid;
$$;

-- Function to get current user ID from session
CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$;

-- Function to get current user role from session
CREATE OR REPLACE FUNCTION app.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(NULLIF(current_setting('app.current_user_role', true), ''), 'requester');
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION app.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT app.current_user_role() = 'admin';
$$;

-- Function to check if user has finance role
CREATE OR REPLACE FUNCTION app.is_finance()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT app.current_user_role() IN ('admin', 'finance');
$$;

-- Function to check if user has manager role or higher
CREATE OR REPLACE FUNCTION app.is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT app.current_user_role() IN ('admin', 'finance', 'manager');
$$;

-- ============================================================================
-- STEP 2: Enable RLS on all tenant-scoped tables
-- ============================================================================

-- Core tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Budgets & Requests
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;

-- Vendors & Connected Data
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_events ENABLE ROW LEVEL SECURITY;

-- Integrations
ALTER TABLE accounting_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_user_mappings ENABLE ROW LEVEL SECURITY;

-- Audit & Security (special handling - read-only for most users)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Invites
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Create RLS policies for ORGANIZATIONS
-- ============================================================================

-- Users can view their own organization
CREATE POLICY "org_select_own"
  ON organizations
  FOR SELECT
  USING (id = app.current_tenant_id());

-- Only admins can update organization settings
CREATE POLICY "org_update_admin"
  ON organizations
  FOR UPDATE
  USING (
    id = app.current_tenant_id()
    AND app.is_admin()
  );

-- No INSERT or DELETE through normal app operations
-- (handled by signup/service account)

-- ============================================================================
-- STEP 4: Create RLS policies for USERS
-- ============================================================================

-- Users can view all users in their organization
CREATE POLICY "users_select_tenant"
  ON users
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  USING (
    id = app.current_user_id()
    AND tenant_id = app.current_tenant_id()
  );

-- Admins can update any user in their organization
CREATE POLICY "users_update_admin"
  ON users
  FOR UPDATE
  USING (
    tenant_id = app.current_tenant_id()
    AND app.is_admin()
  );

-- Only admins can insert/delete users (team management)
CREATE POLICY "users_insert_admin"
  ON users
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_admin());

CREATE POLICY "users_delete_admin"
  ON users
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 5: Create RLS policies for DEPARTMENTS
-- ============================================================================

-- All authenticated users can view departments in their org
CREATE POLICY "departments_select_tenant"
  ON departments
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Managers+ can manage departments
CREATE POLICY "departments_insert_manager"
  ON departments
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_manager());

CREATE POLICY "departments_update_manager"
  ON departments
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_manager());

CREATE POLICY "departments_delete_admin"
  ON departments
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 6: Create RLS policies for BUDGETS
-- ============================================================================

-- All users can view budgets in their organization
CREATE POLICY "budgets_select_tenant"
  ON budgets
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Finance+ can create/update budgets
CREATE POLICY "budgets_insert_finance"
  ON budgets
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_finance());

CREATE POLICY "budgets_update_finance"
  ON budgets
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_finance());

-- Only admins can delete budgets
CREATE POLICY "budgets_delete_admin"
  ON budgets
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 7: Create RLS policies for REQUESTS
-- ============================================================================

-- Users can view requests in their organization
-- (additional app-level filtering may restrict to own department)
CREATE POLICY "requests_select_tenant"
  ON requests
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- All users can create requests
CREATE POLICY "requests_insert_tenant"
  ON requests
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id());

-- Requesters can update their own draft requests
-- Managers+ can update any request in their org
CREATE POLICY "requests_update_own_or_manager"
  ON requests
  FOR UPDATE
  USING (
    tenant_id = app.current_tenant_id()
    AND (
      requester_id = app.current_user_id()
      OR app.is_manager()
    )
  );

-- Only admins can delete requests
CREATE POLICY "requests_delete_admin"
  ON requests
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 8: Create RLS policies for APPROVALS
-- ============================================================================

-- Users can view approvals in their organization
CREATE POLICY "approvals_select_tenant"
  ON approvals
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- System creates approvals (app-level control)
CREATE POLICY "approvals_insert_tenant"
  ON approvals
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id());

-- Approvers can update their assigned approvals
-- Managers+ can update any approval
CREATE POLICY "approvals_update_approver"
  ON approvals
  FOR UPDATE
  USING (
    tenant_id = app.current_tenant_id()
    AND (
      approver_id = app.current_user_id()
      OR app.is_manager()
    )
  );

-- ============================================================================
-- STEP 9: Create RLS policies for VENDORS
-- ============================================================================

-- All users can view vendors in their organization
CREATE POLICY "vendors_select_tenant"
  ON vendors
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Managers+ can manage vendors
CREATE POLICY "vendors_insert_manager"
  ON vendors
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_manager());

CREATE POLICY "vendors_update_manager"
  ON vendors
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_manager());

CREATE POLICY "vendors_delete_admin"
  ON vendors
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 10: Create RLS policies for CONTRACTS
-- ============================================================================

-- All users can view contracts in their organization
CREATE POLICY "contracts_select_tenant"
  ON contracts
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Finance+ can manage contracts
CREATE POLICY "contracts_insert_finance"
  ON contracts
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_finance());

CREATE POLICY "contracts_update_finance"
  ON contracts
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_finance());

CREATE POLICY "contracts_delete_admin"
  ON contracts
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 11: Create RLS policies for SUBSCRIPTIONS
-- ============================================================================

-- All users can view subscriptions in their organization
CREATE POLICY "subscriptions_select_tenant"
  ON subscriptions
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Finance+ can manage subscriptions
CREATE POLICY "subscriptions_insert_finance"
  ON subscriptions
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_finance());

CREATE POLICY "subscriptions_update_finance"
  ON subscriptions
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_finance());

CREATE POLICY "subscriptions_delete_admin"
  ON subscriptions
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 12: Create RLS policies for INVOICES
-- ============================================================================

-- Finance+ can view invoices
CREATE POLICY "invoices_select_finance"
  ON invoices
  FOR SELECT
  USING (tenant_id = app.current_tenant_id() AND app.is_finance());

-- Finance+ can manage invoices
CREATE POLICY "invoices_insert_finance"
  ON invoices
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_finance());

CREATE POLICY "invoices_update_finance"
  ON invoices
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_finance());

-- ============================================================================
-- STEP 13: Create RLS policies for TRIALS
-- ============================================================================

-- All users can view trials in their organization
CREATE POLICY "trials_select_tenant"
  ON trials
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Managers+ can manage trials
CREATE POLICY "trials_insert_manager"
  ON trials
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_manager());

CREATE POLICY "trials_update_manager"
  ON trials
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_manager());

-- ============================================================================
-- STEP 14: Create RLS policies for RENEWAL EVENTS
-- ============================================================================

-- All users can view renewal events in their organization
CREATE POLICY "renewal_events_select_tenant"
  ON renewal_events
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Finance+ can manage renewal events
CREATE POLICY "renewal_events_insert_finance"
  ON renewal_events
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_finance());

CREATE POLICY "renewal_events_update_finance"
  ON renewal_events
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_finance());

-- ============================================================================
-- STEP 15: Create RLS policies for INTEGRATIONS
-- ============================================================================

-- Only admins can view integration tokens
CREATE POLICY "integrations_select_admin"
  ON accounting_integrations
  FOR SELECT
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- Only admins can manage integrations
CREATE POLICY "integrations_insert_admin"
  ON accounting_integrations
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_admin());

CREATE POLICY "integrations_update_admin"
  ON accounting_integrations
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

CREATE POLICY "integrations_delete_admin"
  ON accounting_integrations
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- Sync logs - finance+ can view
CREATE POLICY "sync_logs_select_finance"
  ON accounting_sync_logs
  FOR SELECT
  USING (tenant_id = app.current_tenant_id() AND app.is_finance());

-- System creates sync logs
CREATE POLICY "sync_logs_insert_tenant"
  ON accounting_sync_logs
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id());

-- ============================================================================
-- STEP 16: Create RLS policies for SLACK INTEGRATIONS
-- ============================================================================

-- Admins can view Slack workspace configuration
CREATE POLICY "slack_select_admin"
  ON slack_workspaces
  FOR SELECT
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- Admins can manage Slack workspaces
CREATE POLICY "slack_insert_admin"
  ON slack_workspaces
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_admin());

CREATE POLICY "slack_update_admin"
  ON slack_workspaces
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

CREATE POLICY "slack_delete_admin"
  ON slack_workspaces
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- Slack user mappings - users can view their own, admins can view all
CREATE POLICY "slack_mappings_select_own_or_admin"
  ON slack_user_mappings
  FOR SELECT
  USING (
    tenant_id = app.current_tenant_id()
    AND (
      user_id = app.current_user_id()
      OR app.is_admin()
    )
  );

-- ============================================================================
-- STEP 17: Create RLS policies for AUDIT LOGS (APPEND-ONLY)
-- ============================================================================

-- All users can view audit logs in their organization (limited by app)
CREATE POLICY "audit_logs_select_tenant"
  ON audit_logs
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- System can insert audit logs (no user-level INSERT)
CREATE POLICY "audit_logs_insert_tenant"
  ON audit_logs
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id());

-- NO UPDATE OR DELETE - audit logs are immutable
-- (Enforced by absence of policies)

-- ============================================================================
-- STEP 18: Create RLS policies for AUTH EVENTS (APPEND-ONLY)
-- ============================================================================

-- Only admins can view auth events
CREATE POLICY "auth_events_select_admin"
  ON auth_events
  FOR SELECT
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- System can insert auth events
CREATE POLICY "auth_events_insert_tenant"
  ON auth_events
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() OR tenant_id IS NULL);

-- NO UPDATE OR DELETE - auth events are immutable

-- ============================================================================
-- STEP 19: Create RLS policies for VERIFICATION TOKENS
-- ============================================================================

-- No user-level access to verification tokens
-- Only service accounts can access these
CREATE POLICY "verification_tokens_deny_all"
  ON verification_tokens
  FOR ALL
  USING (false);

-- ============================================================================
-- STEP 20: Create RLS policies for INVITES
-- ============================================================================

-- Admins and managers can view invites
CREATE POLICY "invites_select_manager"
  ON invites
  FOR SELECT
  USING (tenant_id = app.current_tenant_id() AND app.is_manager());

-- Managers+ can create invites
CREATE POLICY "invites_insert_manager"
  ON invites
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_manager());

-- Admins can delete invites
CREATE POLICY "invites_delete_admin"
  ON invites
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 21: Create RLS policies for APPROVAL WORKFLOWS
-- ============================================================================

-- All users can view workflows in their organization
CREATE POLICY "workflows_select_tenant"
  ON approval_workflows
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Managers+ can manage workflows
CREATE POLICY "workflows_insert_manager"
  ON approval_workflows
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_manager());

CREATE POLICY "workflows_update_manager"
  ON approval_workflows
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_manager());

CREATE POLICY "workflows_delete_admin"
  ON approval_workflows
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 22: Create RLS policies for REQUEST TEMPLATES
-- ============================================================================

-- All users can view templates in their organization
CREATE POLICY "templates_select_tenant"
  ON request_templates
  FOR SELECT
  USING (tenant_id = app.current_tenant_id());

-- Managers+ can manage templates
CREATE POLICY "templates_insert_manager"
  ON request_templates
  FOR INSERT
  WITH CHECK (tenant_id = app.current_tenant_id() AND app.is_manager());

CREATE POLICY "templates_update_manager"
  ON request_templates
  FOR UPDATE
  USING (tenant_id = app.current_tenant_id() AND app.is_manager());

CREATE POLICY "templates_delete_admin"
  ON request_templates
  FOR DELETE
  USING (tenant_id = app.current_tenant_id() AND app.is_admin());

-- ============================================================================
-- STEP 23: Grant necessary permissions
-- ============================================================================

-- Grant execute on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION app.current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION app.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_finance() TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_manager() TO authenticated;

-- ============================================================================
-- STEP 24: Create service account bypass for migrations/admin tasks
-- ============================================================================

-- Service role bypasses RLS (for migrations, background jobs, etc.)
-- This is typically set at the database role level
-- ALTER TABLE ... FORCE ROW LEVEL SECURITY; -- Uncomment to force RLS even for table owners

-- ============================================================================
-- VERIFICATION QUERIES (run after migration to verify)
-- ============================================================================

-- Check RLS is enabled on all tables:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND rowsecurity = true;

-- List all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- ============================================================================
-- ROLLBACK PROCEDURES (if needed)
-- ============================================================================

-- OPTION 1: Disable RLS on all tables (keeps policies for re-enable)
-- Run this SQL to disable RLS without dropping policies:
/*
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;
*/

-- OPTION 2: Drop all RLS policies (more destructive, requires re-running migration)
/*
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;
*/

-- OPTION 3: Complete rollback - disable RLS and drop helper functions
/*
-- Disable RLS first
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- Drop policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Drop helper functions
DROP FUNCTION IF EXISTS app.current_tenant_id();
DROP FUNCTION IF EXISTS app.current_user_id();
DROP FUNCTION IF EXISTS app.current_user_role();
DROP FUNCTION IF EXISTS app.is_admin();
DROP FUNCTION IF EXISTS app.is_finance();
DROP FUNCTION IF EXISTS app.is_manager();
*/
