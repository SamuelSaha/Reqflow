/**
 * Development seed data
 * Creates a test organization, departments, users, and budgets
 * Only runs in development mode
 */

import { db } from "./index";
import { organizations, departments, users, budgets } from "./schema";
import { eq } from "drizzle-orm";

// Fixed UUIDs for deterministic dev data
export const DEV_ORG_ID = "00000000-0000-0000-0000-000000000001";
export const DEV_DEPT_ENG_ID = "00000000-0000-0000-0000-000000000010";
export const DEV_DEPT_MKT_ID = "00000000-0000-0000-0000-000000000011";
export const DEV_USER_ADMIN_ID = "00000000-0000-0000-0000-000000000100";
export const DEV_USER_MANAGER_ID = "00000000-0000-0000-0000-000000000101";
export const DEV_USER_REQUESTER_ID = "00000000-0000-0000-0000-000000000102";
export const DEV_USER_FINANCE_ID = "00000000-0000-0000-0000-000000000103";
export const DEV_BUDGET_ENG_ID = "00000000-0000-0000-0000-000000001000";
export const DEV_BUDGET_MKT_ID = "00000000-0000-0000-0000-000000001001";

let seeded = false;

export async function ensureDevSeed() {
  if (seeded) return;
  if (process.env.NODE_ENV !== "development") return;

  // Check if already seeded
  const existing = await db.query.organizations.findFirst({
    where: eq(organizations.id, DEV_ORG_ID),
  });

  if (existing) {
    seeded = true;
    return;
  }

  console.log("[dev-seed] Seeding development data...");

  // Organization
  await db.insert(organizations).values({
    id: DEV_ORG_ID,
    name: "Acme Corp",
    slug: "acme-corp",
    domain: "acme.dev",
    industry: "Technology",
    size: "50-100",
    plan: "growth",
  }).onConflictDoNothing();

  // Departments
  await db.insert(departments).values([
    {
      id: DEV_DEPT_ENG_ID,
      tenantId: DEV_ORG_ID,
      name: "Engineering",
      code: "ENG",
    },
    {
      id: DEV_DEPT_MKT_ID,
      tenantId: DEV_ORG_ID,
      name: "Marketing",
      code: "MKT",
    },
  ]).onConflictDoNothing();

  // Users
  await db.insert(users).values([
    {
      id: DEV_USER_ADMIN_ID,
      tenantId: DEV_ORG_ID,
      email: "admin@acme.dev",
      name: "Alex Admin",
      role: "admin",
      departmentId: DEV_DEPT_ENG_ID,
      isActive: true,
      emailVerified: true,
    },
    {
      id: DEV_USER_MANAGER_ID,
      tenantId: DEV_ORG_ID,
      email: "manager@acme.dev",
      name: "Morgan Manager",
      role: "manager",
      departmentId: DEV_DEPT_ENG_ID,
      isActive: true,
      emailVerified: true,
    },
    {
      id: DEV_USER_REQUESTER_ID,
      tenantId: DEV_ORG_ID,
      email: "dev@acme.dev",
      name: "Sam Developer",
      role: "requester",
      departmentId: DEV_DEPT_ENG_ID,
      isActive: true,
      emailVerified: true,
    },
    {
      id: DEV_USER_FINANCE_ID,
      tenantId: DEV_ORG_ID,
      email: "finance@acme.dev",
      name: "Fiona Finance",
      role: "finance",
      departmentId: DEV_DEPT_ENG_ID,
      isActive: true,
      emailVerified: true,
    },
  ]).onConflictDoNothing();

  // Set department head
  await db
    .update(departments)
    .set({ headId: DEV_USER_MANAGER_ID })
    .where(eq(departments.id, DEV_DEPT_ENG_ID));

  // Budgets
  await db.insert(budgets).values([
    {
      id: DEV_BUDGET_ENG_ID,
      tenantId: DEV_ORG_ID,
      name: "Q1 2026 Engineering",
      type: "department",
      departmentId: DEV_DEPT_ENG_ID,
      category: "saas",
      allocated: "50000.00",
      committed: "12500.00",
      spent: "8200.00",
      period: "quarterly",
      startDate: "2026-01-01",
      endDate: "2026-03-31",
      softLimit: "0.80",
      hardLimit: "1.00",
    },
    {
      id: DEV_BUDGET_MKT_ID,
      tenantId: DEV_ORG_ID,
      name: "Q1 2026 Marketing",
      type: "department",
      departmentId: DEV_DEPT_MKT_ID,
      category: "services",
      allocated: "30000.00",
      committed: "22000.00",
      spent: "5000.00",
      period: "quarterly",
      startDate: "2026-01-01",
      endDate: "2026-03-31",
      softLimit: "0.80",
      hardLimit: "1.00",
    },
  ]).onConflictDoNothing();

  seeded = true;
  console.log("[dev-seed] Development data seeded successfully");
}
