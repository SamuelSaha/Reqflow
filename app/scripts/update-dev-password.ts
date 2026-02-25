/**
 * Update dev user password
 * Run with: tsx scripts/update-dev-password.ts
 */

import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/session";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Updating dev user password...");

  const passwordHash = await hashPassword("password");

  const result = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.email, "admin@acme.dev"))
    .returning();

  if (result.length > 0) {
    console.log("✅ Password updated!");
    console.log({
      email: result[0].email,
      name: result[0].name,
      role: result[0].role,
      hasPassword: !!result[0].passwordHash,
    });
  } else {
    console.log("❌ User not found");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
