import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/auth/password-reset";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Always returns 200 — never reveal if email exists
    await requestPasswordReset(parsed.data.email);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("Password reset request failed", error as Error);
    captureError(error as Error, { route: "/api/auth/request-password-reset" });
    return NextResponse.json({ success: true }); // Still return 200 for security
  }
}
