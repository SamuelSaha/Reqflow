/**
 * Create dev user for testing
 * Run with: tsx scripts/create-dev-user.ts
 */

import { db } from "../src/lib/db";
import { users, organizations, departments } from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/session";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Creating dev user...");

  // Get or create Acme Corp organization
  let org = await db.query.organizations.findFirst({
    where: eq(organizations.name, "Acme Corp"),
  });

  if (!org) {
    console.log("Creating Acme Corp organization...");
    [org] = await db
      .insert(organizations)
      .values({
        name: "Acme Corp",
        slug: "acme",
        domain: "acme.dev",
      })
      .returning();
  }

  // Get or create Engineering department
  let dept = await db.query.departments.findFirst({
    where: eq(departments.name, "Engineering"),
  });

  if (!dept) {
    console.log("Creating Engineering department...");
    [dept] = await db
      .insert(departments)
      .values({
        tenantId: org.id,
        name: "Engineering",
        code: "ENG",
      })
      .returning();
  }

  // Check if dev user already exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, "admin@acme.dev"),
  });

  if (existing) {
    console.log("Dev user already exists!");
    console.log({
      email: existing.email,
      name: existing.name,
      role: existing.role,
    });
    return;
  }

  // Create dev admin user
  const passwordHash = await hashPassword("password");

  const [user] = await db
    .insert(users)
    .values({
      email: "admin@acme.dev",
      name: "Admin User",
      passwordHash,
      role: "admin",
      tenantId: org.id,
      departmentId: dept.id,
      isActive: true,
      emailVerified: true,
    })
    .returning();

  console.log("✅ Dev user created!");
  console.log({
    email: user.email,
    name: user.name,
    role: user.role,
    password: "password",
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
