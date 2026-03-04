/**
 * Web Vitals Data API
 * Provides aggregated Web Vitals metrics for the dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webVitals } from '@/lib/db/schema';
import { sql, and, gte, desc } from 'drizzle-orm';
import { logger } from '@/lib/monitoring/logger';

interface MetricStats {
  metricName: string;
  count: number;
  p50: number;
  p75: number;
  p95: number;
  goodCount: number;
  needsImprovementCount: number;
  poorCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const page = searchParams.get('page') || undefined;

    // Calculate time window
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Build where clause
    const whereConditions = [gte(webVitals.capturedAt, since)];
    if (page) {
      whereConditions.push(sql`${webVitals.page} = ${page}`);
    }

    // Fetch aggregated stats for each metric
    const metrics = ['CLS', 'FCP', 'LCP', 'TTFB', 'INP'] as const;
    const stats: MetricStats[] = [];

    for (const metric of metrics) {
      const result = await db
        .select({
          count: sql<number>`count(*)::int`,
          p50: sql<number>`percentile_cont(0.50) within group (order by ${webVitals.value})`,
          p75: sql<number>`percentile_cont(0.75) within group (order by ${webVitals.value})`,
          p95: sql<number>`percentile_cont(0.95) within group (order by ${webVitals.value})`,
          goodCount: sql<number>`count(*) filter (where ${webVitals.rating} = 'good')::int`,
          needsImprovementCount: sql<number>`count(*) filter (where ${webVitals.rating} = 'needs-improvement')::int`,
          poorCount: sql<number>`count(*) filter (where ${webVitals.rating} = 'poor')::int`,
        })
        .from(webVitals)
        .where(and(
          sql`${webVitals.metricName} = ${metric}`,
          ...whereConditions
        ));

      if (result[0] && result[0].count > 0) {
        stats.push({
          metricName: metric,
          ...result[0],
        });
      }
    }

    // Fetch recent samples for time series
    const recentSamples = await db
      .select({
        metricName: webVitals.metricName,
        value: webVitals.value,
        rating: webVitals.rating,
        page: webVitals.page,
        capturedAt: webVitals.capturedAt,
      })
      .from(webVitals)
      .where(and(...whereConditions))
      .orderBy(desc(webVitals.capturedAt))
      .limit(1000);

    // Get page-level breakdown
    const pageBreakdown = await db
      .select({
        page: webVitals.page,
        metricName: webVitals.metricName,
        count: sql<number>`count(*)::int`,
        avgValue: sql<number>`avg(${webVitals.value})`,
        poorCount: sql<number>`count(*) filter (where ${webVitals.rating} = 'poor')::int`,
      })
      .from(webVitals)
      .where(and(...whereConditions))
      .groupBy(webVitals.page, webVitals.metricName)
      .orderBy(sql`count(*) desc`)
      .limit(50);

    return NextResponse.json({
      stats,
      recentSamples,
      pageBreakdown,
      period: {
        hours,
        since: since.toISOString(),
        until: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch web vitals data', error as Error);

    return NextResponse.json(
      { error: 'Failed to fetch web vitals data' },
      { status: 500 }
    );
  }
}
