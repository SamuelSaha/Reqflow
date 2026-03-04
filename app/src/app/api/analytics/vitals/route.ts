/**
 * Web Vitals Analytics Endpoint
 * Receives Core Web Vitals metrics from client instrumentation
 * Stores in PostgreSQL database and sends to Axiom for analysis and alerting
 */

import { NextRequest, NextResponse } from 'next/server';
import { axiom } from '@/lib/monitoring/axiom';
import { logger } from '@/lib/monitoring/logger';
import { db } from '@/lib/db';
import { webVitals } from '@/lib/db/schema';

interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
  url: string;
  userAgent: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();

    // Validate metric
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Extract page pathname
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
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
