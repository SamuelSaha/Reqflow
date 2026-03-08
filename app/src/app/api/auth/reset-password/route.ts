import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeResetToken } from "@/lib/auth/password-reset";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

const schema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => e.message);
      return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
    }

    const success = await consumeResetToken(parsed.data.token, parsed.data.password);

    if (!success) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("Password reset failed", error as Error);
    captureError(error as Error, { route: "/api/auth/reset-password" });
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
