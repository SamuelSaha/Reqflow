/**
 * MFA Setup API
 * 🔒 SECURITY (issue #121): Enable MFA for user account
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  setupMFA,
  verifyTOTP,
  hashBackupCodes,
} from "@/lib/auth/mfa";
import { getSession } from "@/lib/auth/session";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If MFA already enabled, don't generate new secret
    if (user.mfaEnabled && user.mfaSecret) {
      return NextResponse.json({
        mfaEnabled: true,
        message: "MFA is already enabled. Disable it first to set up a new device.",
      });
    }

    // Generate MFA setup data
    const setup = await setupMFA(user.email);

    // Temporarily store the secret (not enabled yet)
    await db
      .update(users)
      .set({
        mfaSecret: setup.secret,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      qrCodeDataUrl: setup.qrCodeDataUrl,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
      mfaEnabled: false,
    });
  } catch (error: unknown) {
    logger.error("MFA setup failed", error as Error, { route: "/api/auth/mfa/setup" });
    captureError(error as Error, { route: "/api/auth/mfa/setup" });
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, backupCodes } = body;

    if (!code || !backupCodes || !Array.isArray(backupCodes)) {
      return NextResponse.json(
        { error: "Verification code and backup codes are required" },
        { status: 400 }
      );
    }

    // Get user with pending MFA secret
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.mfaSecret) {
      return NextResponse.json(
        { error: "MFA setup not initiated. Start setup first." },
        { status: 400 }
      );
    }

    // Verify TOTP code
    const isValid = verifyTOTP(user.mfaSecret, code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Hash backup codes for storage
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    // Enable MFA
    await db
      .update(users)
      .set({
        mfaEnabled: true,
        mfaBackupCodes: hashedBackupCodes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    logger.info("MFA enabled for user", { userId: user.id });

    return NextResponse.json({
      success: true,
      message: "MFA has been enabled for your account",
    });
  } catch (error: unknown) {
    logger.error("MFA enable failed", error as Error, { route: "/api/auth/mfa/setup" });
    captureError(error as Error, { route: "/api/auth/mfa/setup" });
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Disable MFA
    await db
      .update(users)
      .set({
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId));

    logger.info("MFA disabled for user", { userId: session.userId });

    return NextResponse.json({
      success: true,
      message: "MFA has been disabled for your account",
    });
  } catch (error: unknown) {
    logger.error("MFA disable failed", error as Error, { route: "/api/auth/mfa/setup" });
    captureError(error as Error, { route: "/api/auth/mfa/setup" });
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
