/**
 * Database Health Endpoint
 * GET /api/health/database - Database connection and stats
 */

import { NextResponse } from "next/server";
import { checkDatabase, getUptime, getVersion } from "@/lib/monitoring/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const database = await checkDatabase();

    const statusCode = database.status === "unhealthy" ? 503 : 200;

    return NextResponse.json(
      {
        status: database.status,
        timestamp: new Date().toISOString(),
        uptime: getUptime(),
        version: getVersion(),
        database,
      },
      { status: statusCode }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Database check failed",
      },
      { status: 503 }
    );
  }
}
