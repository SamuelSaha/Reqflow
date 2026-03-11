/**
 * Integrations Health Endpoint
 * GET /api/health/integrations - External service status
 */

import { NextResponse } from "next/server";
import {
  checkSlack,
  checkQuickBooks,
  checkXero,
  checkResend,
  checkStorage,
  getOverallStatus,
  getUptime,
  getVersion,
} from "@/lib/monitoring/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [slack, quickbooks, xero, resend, storage] = await Promise.all([
      checkSlack(),
      checkQuickBooks(),
      checkXero(),
      checkResend(),
      checkStorage(),
    ]);

    const checks = { slack, quickbooks, xero, resend, storage };
    const status = getOverallStatus(Object.values(checks));

    const statusCode = status === "unhealthy" ? 503 : 200;

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        uptime: getUptime(),
        version: getVersion(),
        integrations: checks,
      },
      { status: statusCode }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Service unavailable",
      },
      { status: 503 }
    );
  }
}
