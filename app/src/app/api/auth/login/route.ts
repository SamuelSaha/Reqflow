import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth/session";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await signIn(email, password);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    });
  } catch (error: unknown) {
    logger.error("Login failed", error as Error, { route: "/api/auth/login" });
    captureError(error as Error, { route: "/api/auth/login" });
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
