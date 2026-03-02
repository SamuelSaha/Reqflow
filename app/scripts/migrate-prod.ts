/**
 * Production Migration Runner
 * Runs Drizzle ORM migrations against the production database.
 * Used by CI/CD pipeline (.github/workflows/deploy.yml).
 *
 * Usage: npx tsx scripts/migrate-prod.ts
 * Requires: DATABASE_URL environment variable
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const { Pool } = pg;

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    // Short timeouts for CI — fail fast rather than hang
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 10_000,
    max: 1,
  });

  try {
    // Verify connectivity before running migrations
    console.log("🔗 Connecting to database...");
    const client = await pool.connect();
    const { rows } = await client.query("SELECT current_database(), current_user");
    console.log(`   Connected to "${rows[0].current_database}" as "${rows[0].current_user}"`);
    client.release();

    // Run migrations from the drizzle output directory
    console.log("🔄 Running migrations...");
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("✅ All migrations applied successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
