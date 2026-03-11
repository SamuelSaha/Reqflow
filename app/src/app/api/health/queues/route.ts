/**
 * Queue Health Endpoint
 * GET /api/health/queues - Queue job counts and status
 */

import { NextResponse } from "next/server";
import { checkQueues, getUptime, getVersion } from "@/lib/monitoring/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const queues = await checkQueues();

    const statusCode = queues.status === "unhealthy" ? 503 : 200;

    return NextResponse.json(
      {
        status: queues.status,
        timestamp: new Date().toISOString(),
        uptime: getUptime(),
        version: getVersion(),
        queues: queues.details,
        message: queues.message,
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
