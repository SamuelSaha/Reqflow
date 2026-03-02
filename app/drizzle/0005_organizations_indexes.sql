-- Add indexes to organizations table for performance
-- domain: used for email-domain auto-join lookup on signup (full table scan without this)
-- plan: used for filtering by subscription tier

CREATE INDEX IF NOT EXISTS "organizations_domain_idx" ON "organizations"("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organizations_plan_idx" ON "organizations"("plan");
