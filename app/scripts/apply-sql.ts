/**
 * Apply SQL file directly to the database
 * Run with: npx dotenv -e .env.local -- tsx scripts/apply-sql.ts <sql-file>
 */

import { readFileSync } from "fs";
import postgres from "postgres";
import { env } from "../src/lib/env";

const sqlFile = process.argv[2];

if (!sqlFile) {
  console.error("Usage: npx dotenv -e .env.local -- tsx scripts/apply-sql.ts <sql-file>");
  process.exit(1);
}

async function main() {
  const sql = postgres(env.DATABASE_URL);
  const sqlContent = readFileSync(sqlFile, "utf-8");

  console.log(`📝 Applying SQL from ${sqlFile}...\n`);
  console.log(sqlContent);
  console.log();

  try {
    await sql.unsafe(sqlContent);
    console.log("✅ SQL applied successfully!");
  } catch (err) {
    console.error("❌ SQL failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
