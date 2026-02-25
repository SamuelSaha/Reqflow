/**
 * Create Slack integration tables
 * Run with: tsx scripts/migrate-slack-tables.ts
 */

import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating Slack integration tables...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS slack_workspaces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      slack_team_id TEXT NOT NULL UNIQUE,
      slack_team_name TEXT NOT NULL,
      bot_token TEXT NOT NULL,
      bot_user_id TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true NOT NULL,
      installed_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  console.log("✓ Created slack_workspaces table");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS slack_user_mappings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      slack_user_id TEXT NOT NULL,
      slack_email TEXT NOT NULL,
      reqflow_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      CONSTRAINT slack_user_mappings_tenant_slack_unique UNIQUE(tenant_id, slack_user_id)
    );
  `);

  console.log("✓ Created slack_user_mappings table");

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS slack_workspaces_tenant_idx ON slack_workspaces(tenant_id);
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS slack_workspaces_team_idx ON slack_workspaces(slack_team_id);
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS slack_user_mappings_slack_id_idx ON slack_user_mappings(slack_user_id);
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS slack_user_mappings_tenant_idx ON slack_user_mappings(tenant_id);
  `);

  console.log("✓ Created all indexes");
  console.log("\n✅ Slack integration tables created successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
