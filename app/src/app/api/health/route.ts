/**
 * Main Health Check Endpoint
 * GET /api/health - Overall system health
 */

import { NextResponse } from "next/server";
import { getSystemHealth } from "@/lib/monitoring/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await getSystemHealth();

    const statusCode = health.status === "unhealthy" ? 503 : 200;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 503 }
    );
  }
}
