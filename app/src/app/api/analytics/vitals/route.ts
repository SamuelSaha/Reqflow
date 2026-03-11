/**
 * Web Vitals Analytics Endpoint
 * Receives Core Web Vitals metrics from client instrumentation
 * Stores in PostgreSQL database and sends to Axiom for analysis and alerting
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { axiom } from '@/lib/monitoring/axiom';
import { logger } from '@/lib/monitoring/logger';
import { db } from '@/lib/db';
import { webVitals } from '@/lib/db/schema';

// 🔒 SECURITY: Strict schema prevents metric injection / DB flooding
const webVitalSchema = z.object({
  name: z.enum(['CLS', 'FCP', 'LCP', 'TTFB', 'INP']),
  value: z.number().min(0).max(60_000), // max 60s covers any real-world metric
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number().min(-60_000).max(60_000),
  id: z.string().max(64),
  navigationType: z.enum(['navigate', 'reload', 'back-forward', 'prerender']),
  url: z.string().url().max(2048),
  userAgent: z.string().max(512),
  timestamp: z.number().int().min(0),
});

type WebVitalMetric = z.infer<typeof webVitalSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 🔒 SECURITY: Validate all fields strictly — this is a public unauthenticated endpoint
    const parsed = webVitalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    const metric: WebVitalMetric = parsed.data;

    // Extract page pathname (safe — URL already validated by Zod)
    const page = new URL(metric.url).pathname;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Store in PostgreSQL database for historical analysis and dashboards
    try {
      await db.insert(webVitals).values({
        metricName: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        metricId: metric.id,
        navigationType: metric.navigationType,
        url: metric.url,
        page,
        userAgent: metric.userAgent,
        ip,
        capturedAt: new Date(metric.timestamp),
      });
    } catch (dbError) {
      // Log database errors but don't fail the request
      // Metrics collection is best-effort
      logger.error('Failed to store web vital in database', dbError as Error);
    }

    // Send to Axiom for real-time analysis and alerting
    await axiom.ingest('web-vitals', [
      {
        _time: new Date(metric.timestamp).toISOString(),
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        navigation: metric.navigationType,
        url: metric.url,
        page,
        userAgent: metric.userAgent,
        ip,
        // Note: Next.js 16 removed request.geo from edge runtime
        // Geolocation can be derived from IP in Axiom queries if needed
      },
    ]);

    // Also log in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(
        `Web Vital: ${metric.name} = ${metric.value}ms (${metric.rating})`
      );
    }

    // Check for performance regressions (alert thresholds)
    const alerts: string[] = [];

    switch (metric.name) {
      case 'FCP':
        if (metric.value > 500) {
          alerts.push(`FCP exceeded 500ms: ${metric.value}ms`);
        }
        break;
      case 'LCP':
        if (metric.value > 2500) {
          alerts.push(`LCP exceeded 2.5s: ${metric.value}ms`);
        }
        break;
      case 'CLS':
        if (metric.value > 0.1) {
          alerts.push(`CLS exceeded 0.1: ${metric.value}`);
        }
        break;
      case 'INP':
        if (metric.value > 200) {
          alerts.push(`INP exceeded 200ms: ${metric.value}ms`);
        }
        break;
      case 'TTFB':
        if (metric.value > 800) {
          alerts.push(`TTFB exceeded 800ms: ${metric.value}ms`);
        }
        break;
    }

    // Log alerts (in production, this could trigger Slack/PagerDuty)
    if (alerts.length > 0) {
      logger.warn('Performance threshold exceeded', { alerts, metric: metric.name, value: metric.value });

      // Send alert to Axiom
      await axiom.ingest('performance-alerts', [
        {
          _time: new Date().toISOString(),
          alerts,
          metric: metric.name,
          value: metric.value,
          url: metric.url,
          severity: 'warning',
        },
      ]);
    }

    return NextResponse.json({ success: true }, { status: 202 }); // 202 Accepted
  } catch (error) {
    logger.error('Failed to process web vital', error as Error);

    // Don't fail loudly - metrics are best-effort
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
// 🔒 SECURITY: Restrict to app origin only — prevents cross-site metric injection
export async function OPTIONS() {
  const origin = process.env.NEXT_PUBLIC_APP_URL || '';
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      },
    }
  );
}
