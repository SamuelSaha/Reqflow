CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"domain" text,
	"industry" text,
	"size" text,
	"plan" text DEFAULT 'starter' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"password_hash" text,
	"role" text DEFAULT 'requester' NOT NULL,
	"department_id" uuid,
	"better_auth_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"mfa_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "users_better_auth_id_unique" UNIQUE("better_auth_id")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"description" text,
	"head_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"parent_id" uuid,
	"department_id" uuid,
	"category" text,
	"allocated" numeric(12, 2) NOT NULL,
	"committed" numeric(12, 2) DEFAULT '0' NOT NULL,
	"spent" numeric(12, 2) DEFAULT '0' NOT NULL,
	"period" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"soft_limit" numeric(3, 2) DEFAULT '0.80',
	"hard_limit" numeric(3, 2) DEFAULT '1.00',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"request_number" text NOT NULL,
	"requester_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"vendor_name" text,
	"vendor_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"frequency" text DEFAULT 'one-time' NOT NULL,
	"quantity" integer DEFAULT 1,
	"budget_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"urgency" text DEFAULT 'normal' NOT NULL,
	"ai_category" text,
	"ai_category_confidence" numeric(3, 2),
	"duplicate_check_performed" boolean DEFAULT false,
	"potential_duplicates" jsonb,
	"custom_fields" jsonb,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	CONSTRAINT "requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"request_id" uuid NOT NULL,
	"approver_id" uuid NOT NULL,
	"step" integer NOT NULL,
	"required" text DEFAULT 'required' NOT NULL,
	"decision" text DEFAULT 'pending' NOT NULL,
	"comments" text,
	"context" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"decided_at" timestamp,
	"notified_at" timestamp,
	"reminder_sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "approval_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"conditions" jsonb NOT NULL,
	"approval_chain" jsonb NOT NULL,
	"escalation" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"user_email" text,
	"user_name" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"description" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid,
	"user_email" text,
	"event" text NOT NULL,
	"success" text NOT NULL,
	"reason" text,
	"ip_address" text,
	"user_agent" text,
	"location" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slack_workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"slack_team_id" text NOT NULL,
	"slack_team_name" text NOT NULL,
	"bot_token" text NOT NULL,
	"bot_user_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"installed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "slack_workspaces_slack_team_id_unique" UNIQUE("slack_team_id")
);
--> statement-breakpoint
CREATE TABLE "slack_user_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"slack_user_id" text NOT NULL,
	"slack_email" text NOT NULL,
	"reqflow_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "slack_user_mappings_tenant_slack_unique" UNIQUE("tenant_id","slack_user_id")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"legal_name" text,
	"website" text,
	"industry" text,
	"billing_names" jsonb,
	"primary_contact" jsonb,
	"compliance_tier" text DEFAULT 'none' NOT NULL,
	"compliance_docs" jsonb,
	"tax_id" text,
	"country" text,
	"status" text DEFAULT 'active' NOT NULL,
	"performance_score" numeric(3, 2),
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"title" text NOT NULL,
	"contract_number" text,
	"type" text DEFAULT 'subscription' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"auto_renew" boolean DEFAULT false NOT NULL,
	"renewal_date" date,
	"notice_deadline" date,
	"notice_period_days" numeric,
	"uplift_cap" numeric(5, 2),
	"total_value" numeric(12, 2),
	"currency" text DEFAULT 'EUR' NOT NULL,
	"payment_terms" text,
	"extracted_terms" jsonb,
	"owner_id" uuid,
	"document_url" text,
	"amendments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"contract_id" uuid,
	"department_id" uuid,
	"tool_name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"plan" text,
	"seats" integer,
	"active_seats" integer,
	"cost_per_seat" numeric(12, 2),
	"total_cost" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"owner_id" uuid,
	"requested_by_id" uuid,
	"add_ons" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vendor_id" uuid,
	"contract_id" uuid,
	"subscription_id" uuid,
	"invoice_number" text,
	"external_ref" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"tax_amount" numeric(12, 2),
	"total_amount" numeric(12, 2) NOT NULL,
	"line_items" jsonb,
	"issue_date" date NOT NULL,
	"due_date" date,
	"period_start" date,
	"period_end" date,
	"status" text DEFAULT 'pending' NOT NULL,
	"match_status" text DEFAULT 'unmatched',
	"match_confidence" numeric(3, 2),
	"variance_amount" numeric(12, 2),
	"variance_reason" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"source_ref" text,
	"document_url" text,
	"cost_center" text,
	"accounting_category" text,
	"synced_to_accounting" boolean DEFAULT false NOT NULL,
	"accounting_sync_ref" text,
	"approved_by_id" uuid,
	"approved_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vendor_id" uuid,
	"department_id" uuid,
	"tool_name" text NOT NULL,
	"category" text,
	"description" text,
	"initiated_by_id" uuid NOT NULL,
	"stakeholders" jsonb,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"success_criteria" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"decision" text,
	"decision_date" timestamp,
	"decision_notes" text,
	"converted_request_id" uuid,
	"estimated_cost" text,
	"estimated_annual_cost" text,
	"reminders_sent" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "renewal_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contract_id" uuid,
	"subscription_id" uuid,
	"renewal_date" date NOT NULL,
	"notice_deadline" date NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"decision" text,
	"decision_date" timestamp,
	"decision_by_id" uuid,
	"decision_notes" text,
	"readiness_score" jsonb,
	"checkpoints" jsonb,
	"new_contract_id" uuid,
	"savings_amount" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_head_id_users_id_fk" FOREIGN KEY ("head_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_workflows" ADD CONSTRAINT "approval_workflows_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_events" ADD CONSTRAINT "auth_events_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_events" ADD CONSTRAINT "auth_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slack_workspaces" ADD CONSTRAINT "slack_workspaces_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slack_user_mappings" ADD CONSTRAINT "slack_user_mappings_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slack_user_mappings" ADD CONSTRAINT "slack_user_mappings_reqflow_user_id_users_id_fk" FOREIGN KEY ("reqflow_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trials" ADD CONSTRAINT "trials_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trials" ADD CONSTRAINT "trials_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trials" ADD CONSTRAINT "trials_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trials" ADD CONSTRAINT "trials_converted_request_id_requests_id_fk" FOREIGN KEY ("converted_request_id") REFERENCES "public"."requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewal_events" ADD CONSTRAINT "renewal_events_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewal_events" ADD CONSTRAINT "renewal_events_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renewal_events" ADD CONSTRAINT "renewal_events_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_better_auth_idx" ON "users" USING btree ("better_auth_id");--> statement-breakpoint
CREATE INDEX "departments_tenant_idx" ON "departments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "budgets_tenant_idx" ON "budgets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "budgets_department_idx" ON "budgets" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "budgets_period_idx" ON "budgets" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "requests_tenant_idx" ON "requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "requests_requester_idx" ON "requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "requests_status_idx" ON "requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "requests_department_idx" ON "requests" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "requests_created_idx" ON "requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "approvals_tenant_idx" ON "approvals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "approvals_request_idx" ON "approvals" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "approvals_approver_idx" ON "approvals" USING btree ("approver_id");--> statement-breakpoint
CREATE INDEX "approvals_decision_idx" ON "approvals" USING btree ("decision");--> statement-breakpoint
CREATE INDEX "approval_workflows_tenant_idx" ON "approval_workflows" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "approval_workflows_active_idx" ON "approval_workflows" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "auth_events_tenant_idx" ON "auth_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "auth_events_user_idx" ON "auth_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_events_event_idx" ON "auth_events" USING btree ("event");--> statement-breakpoint
CREATE INDEX "auth_events_created_idx" ON "auth_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "slack_workspaces_tenant_idx" ON "slack_workspaces" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "slack_workspaces_team_idx" ON "slack_workspaces" USING btree ("slack_team_id");--> statement-breakpoint
CREATE INDEX "slack_user_mappings_slack_id_idx" ON "slack_user_mappings" USING btree ("slack_user_id");--> statement-breakpoint
CREATE INDEX "slack_user_mappings_tenant_idx" ON "slack_user_mappings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "vendors_tenant_idx" ON "vendors" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "vendors_name_idx" ON "vendors" USING btree ("name");--> statement-breakpoint
CREATE INDEX "vendors_status_idx" ON "vendors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contracts_tenant_idx" ON "contracts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "contracts_vendor_idx" ON "contracts" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contracts_renewal_idx" ON "contracts" USING btree ("renewal_date");--> statement-breakpoint
CREATE INDEX "contracts_notice_idx" ON "contracts" USING btree ("notice_deadline");--> statement-breakpoint
CREATE INDEX "subscriptions_tenant_idx" ON "subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "subscriptions_vendor_idx" ON "subscriptions" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "subscriptions_contract_idx" ON "subscriptions" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "subscriptions_department_idx" ON "subscriptions" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_category_idx" ON "subscriptions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "invoices_tenant_idx" ON "invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "invoices_vendor_idx" ON "invoices" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "invoices_contract_idx" ON "invoices" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "invoices_subscription_idx" ON "invoices" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_match_idx" ON "invoices" USING btree ("match_status");--> statement-breakpoint
CREATE INDEX "invoices_due_idx" ON "invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "trials_tenant_idx" ON "trials" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "trials_vendor_idx" ON "trials" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "trials_status_idx" ON "trials" USING btree ("status");--> statement-breakpoint
CREATE INDEX "trials_end_date_idx" ON "trials" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "trials_initiated_by_idx" ON "trials" USING btree ("initiated_by_id");--> statement-breakpoint
CREATE INDEX "renewal_events_tenant_idx" ON "renewal_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "renewal_events_contract_idx" ON "renewal_events" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "renewal_events_status_idx" ON "renewal_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "renewal_events_renewal_date_idx" ON "renewal_events" USING btree ("renewal_date");--> statement-breakpoint
CREATE INDEX "renewal_events_notice_deadline_idx" ON "renewal_events" USING btree ("notice_deadline");