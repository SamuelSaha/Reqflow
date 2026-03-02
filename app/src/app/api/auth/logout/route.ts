import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth/session";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";
import { withCSRF } from "@/lib/security/csrf";

export const POST = withCSRF(async () => {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("Logout failed", error as Error, { route: "/api/auth/logout" });
    captureError(error as Error, { route: "/api/auth/logout" });
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
});
