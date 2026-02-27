/**
 * Simple Ping Endpoint
 * GET /api/health/ping - Simple 200 OK for uptime monitors
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ pong: true, timestamp: new Date().toISOString() });
}
