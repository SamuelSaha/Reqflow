/**
 * Xero OAuth Connect Endpoint
 * Initiates OAuth 2.0 authorization flow
 */

import { NextResponse } from "next/server";
import { XeroClient } from "xero-node";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/sentry";

export async function GET() {
  try {
    if (!env.XERO_CLIENT_ID || !env.XERO_CLIENT_SECRET || !env.XERO_REDIRECT_URI) {
      return NextResponse.json(
        { error: "Xero OAuth not configured. Please set environment variables." },
        { status: 500 }
      );
    }

    const xero = new XeroClient({
      clientId: env.XERO_CLIENT_ID,
      clientSecret: env.XERO_CLIENT_SECRET,
      redirectUris: [env.XERO_REDIRECT_URI],
      scopes: "offline_access accounting.transactions accounting.contacts accounting.settings.read".split(" "),
    });

    // Generate authorization URL
    const consentUrl = await xero.buildConsentUrl();

    logger.info("Xero OAuth flow initiated");

    // Redirect to Xero authorization page
    return NextResponse.redirect(consentUrl);
  } catch (error: unknown) {
    logger.error("Xero OAuth connect failed", error as Error);
    captureError(error as Error, { route: "/api/integrations/xero/connect" });
    return NextResponse.json(
      { error: "Failed to initiate Xero connection" },
      { status: 500 }
    );
  }
}
