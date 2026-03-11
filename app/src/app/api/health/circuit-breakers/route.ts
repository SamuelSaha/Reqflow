/**
 * Circuit Breaker Health Endpoint
 * Returns status of all circuit breakers for monitoring
 */

import { NextResponse } from "next/server";
import { circuitBreakerRegistry } from "@/lib/resilience/circuit-breaker";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = circuitBreakerRegistry.getAllStats();

    // Calculate overall health
    const services = Object.keys(stats);
    const openCircuits = services.filter((s) => stats[s].state === "OPEN");
    const halfOpenCircuits = services.filter((s) => stats[s].state === "HALF_OPEN");

    const overallHealth = openCircuits.length === 0 ? "healthy" : "degraded";

    return NextResponse.json({
      health: overallHealth,
      timestamp: new Date().toISOString(),
      summary: {
        totalServices: services.length,
        healthy: services.filter((s) => stats[s].state === "CLOSED").length,
        degraded: halfOpenCircuits.length,
        down: openCircuits.length,
      },
      services: stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        health: "error",
        error: "Service unavailable",
      },
      { status: 500 }
    );
  }
}
