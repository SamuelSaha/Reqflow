import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users, departments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // For MVP, create organization if needed or use default
    // TODO: In production, handle organization creation separately
    let tenantId: string;
    let departmentId: string;

    const defaultOrg = await db.query.organizations.findFirst();
    if (defaultOrg) {
      tenantId = defaultOrg.id;
      // Get first department from this org
      const dept = await db.query.departments.findFirst({
        where: eq(departments.tenantId, defaultOrg.id),
      });
      departmentId = dept?.id || "";
    } else {
      return NextResponse.json(
        { error: "No organization found. Please contact support." },
        { status: 500 }
      );
    }

    const user = await createUser({
      email,
      password,
      name,
      role: "requester",
      tenantId,
      departmentId,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
