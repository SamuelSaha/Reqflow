/**
 * Seed development database with test data
 * Run with: npx dotenv -e .env.local -- tsx scripts/seed-dev.ts
 */
import { ensureDevSeed } from "../src/lib/db/dev-seed";
import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding development database...\n");

  // Run the dev seed (creates org, departments, users, budgets)
  await ensureDevSeed();

  // Set passwords for dev users
  const devPassword = "password123"; // Simple dev password
  const passwordHash = await bcrypt.hash(devPassword, 12);

  const devEmails = [
    "admin@acme.dev",
    "manager@acme.dev",
    "dev@acme.dev",
    "finance@acme.dev",
  ];

  console.log("\n🔐 Setting passwords for dev users...");

  for (const email of devEmails) {
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.email, email));
    console.log(`  ✓ ${email} (password: ${devPassword})`);
  }

  console.log("\n✅ Development database seeded successfully!");
  console.log("\n📝 You can now log in with any of these accounts:");
  console.log("   • admin@acme.dev (Admin)");
  console.log("   • manager@acme.dev (Manager)");
  console.log("   • dev@acme.dev (Requester)");
  console.log("   • finance@acme.dev (Finance)");
  console.log(`   Password for all: ${devPassword}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
