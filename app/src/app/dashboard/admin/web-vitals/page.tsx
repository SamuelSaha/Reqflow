/**
 * Web Vitals Dashboard
 * /dashboard/admin/web-vitals - Performance monitoring and Core Web Vitals analysis
 * Related to Issue #133: Establish Web Vitals baseline and monitoring
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowLeft,
  Clock,
  Gauge,
  Eye,
  Layers,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { WEB_VITAL_THRESHOLDS } from "@/lib/db/schema";

type MetricName = "CLS" | "FCP" | "LCP" | "TTFB" | "INP";

interface MetricStats {
  metricName: MetricName;
  count: number;
  p50: number;
  p75: number;
  p95: number;
  goodCount: number;
  needsImprovementCount: number;
  poorCount: number;
}

interface PageBreakdownItem {
  page: string;
  metricName: MetricName;
  count: number;
  avgValue: number;
  poorCount: number;
}

interface WebVitalsData {
  stats: MetricStats[];
  pageBreakdown: PageBreakdownItem[];
  period: {
    hours: number;
    since: string;
    until: string;
  };
}

const METRIC_INFO: Record<MetricName, { name: string; description: string; icon: React.ElementType; unit: string }> = {
  CLS: {
    name: "Cumulative Layout Shift",
    description: "Visual stability - lower is better",
    icon: Layers,
    unit: "",
  },
  FCP: {
    name: "First Contentful Paint",
    description: "Time to first content render",
    icon: Eye,
    unit: "ms",
  },
  LCP: {
    name: "Largest Contentful Paint",
    description: "Time to largest content render",
    icon: Gauge,
    unit: "ms",
  },
  TTFB: {
    name: "Time to First Byte",
    description: "Server response time",
    icon: Zap,
    unit: "ms",
  },
  INP: {
    name: "Interaction to Next Paint",
    description: "Responsiveness to user interactions",
    icon: Activity,
    unit: "ms",
  },
};

function formatMetricValue(value: number, metricName: MetricName): string {
  const unit = METRIC_INFO[metricName].unit;

  if (metricName === "CLS") {
    return value.toFixed(3);
  }

  return `${Math.round(value)}${unit}`;
}

function getMetricRating(value: number, metricName: MetricName): "good" | "needs-improvement" | "poor" {
  const thresholds = WEB_VITAL_THRESHOLDS[metricName];

  if (value <= thresholds.good) {
    return "good";
  } else if (value <= thresholds.poor) {
    return "needs-improvement";
  } else {
    return "poor";
  }
}

function RatingBadge({ rating }: { rating: "good" | "needs-improvement" | "poor" }) {
  const styles = {
    good: { variant: "default" as const, className: "bg-green-100 text-green-800 border-green-200" },
    "needs-improvement": { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    poor: { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200" },
  };

  const { className } = styles[rating];
  const label = rating === "needs-improvement" ? "Needs Work" : rating.charAt(0).toUpperCase() + rating.slice(1);

  return (
    <Badge className={className}>
      {label}
    </Badge>
  );
}

function MetricCard({ stat }: { stat: MetricStats }) {
  const info = METRIC_INFO[stat.metricName];
  const Icon = info.icon;
  const p75Rating = getMetricRating(stat.p75, stat.metricName);
  const goodPercentage = (stat.goodCount / stat.count) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{stat.metricName}</CardTitle>
              <CardDescription className="text-xs">{info.name}</CardDescription>
            </div>
          </div>
          <RatingBadge rating={p75Rating} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* P75 Value (Primary Metric) */}
          <div>
            <div className="text-3xl font-bold text-slate-900">
              {formatMetricValue(stat.p75, stat.metricName)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              75th percentile (target metric)
            </div>
          </div>

          {/* Percentile Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-sm font-semibold text-slate-700">
                {formatMetricValue(stat.p50, stat.metricName)}
              </div>
              <div className="text-xs text-slate-500">p50</div>
            </div>
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm font-semibold text-blue-700">
                {formatMetricValue(stat.p75, stat.metricName)}
              </div>
              <div className="text-xs text-blue-600">p75</div>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-sm font-semibold text-slate-700">
                {formatMetricValue(stat.p95, stat.metricName)}
              </div>
              <div className="text-xs text-slate-500">p95</div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Performance Distribution</span>
              <span className="text-xs font-medium text-green-600">{goodPercentage.toFixed(0)}% good</span>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
              <div
                className="bg-green-500"
                style={{ width: `${(stat.goodCount / stat.count) * 100}%` }}
              />
              <div
                className="bg-yellow-500"
                style={{ width: `${(stat.needsImprovementCount / stat.count) * 100}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${(stat.poorCount / stat.count) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-500">
              <span>{stat.goodCount} good</span>
              <span>{stat.needsImprovementCount} needs work</span>
              <span>{stat.poorCount} poor</span>
            </div>
          </div>

          {/* Sample Count */}
          <div className="text-xs text-slate-500 pt-2 border-t">
            {stat.count.toLocaleString()} samples collected
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WebVitalsDashboard() {
  const [data, setData] = useState<WebVitalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(24);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics/web-vitals?hours=${hours}`);
      if (response.ok) {
        const json = await response.json();
        setData(json);
      } else {
        setError(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setError('Unable to connect to analytics API. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hours]);

  // Calculate overall health score (percentage of good p75 metrics)
  const healthScore = data?.stats.length
    ? (data.stats.filter(s => getMetricRating(s.p75, s.metricName) === 'good').length / data.stats.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Web Vitals Dashboard</h1>
              <p className="text-slate-600 mt-1">
                Core Web Vitals performance monitoring and analysis
              </p>
            </div>
          </div>
          <Button onClick={fetchData} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Time Period Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Time Period:</span>
              </div>
              <div className="flex gap-2">
                {[1, 6, 24, 168].map((h) => (
                  <Button
                    key={h}
                    variant={hours === h ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHours(h)}
                  >
                    {h === 1 ? '1 hour' : h === 6 ? '6 hours' : h === 24 ? '24 hours' : '7 days'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Health Score */}
        {data && (
          <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Overall Health Score</div>
                  <div className="text-4xl font-bold text-slate-900">{healthScore.toFixed(0)}%</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {data.stats.filter(s => getMetricRating(s.p75, s.metricName) === 'good').length} of {data.stats.length} metrics passing
                  </div>
                </div>
                <div className="text-right">
                  {healthScore >= 80 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="h-6 w-6" />
                      <span className="font-semibold">Excellent</span>
                    </div>
                  ) : healthScore >= 60 ? (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Activity className="h-6 w-6" />
                      <span className="font-semibold">Good</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <TrendingDown className="h-6 w-6" />
                      <span className="font-semibold">Needs Work</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-6 bg-slate-200 rounded w-24" /></CardHeader>
                <CardContent><div className="h-32 bg-slate-100 rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-red-900 font-semibold mb-2">Failed to Load Data</p>
                <p className="text-red-700 text-sm mb-4">{error}</p>
                <Button onClick={fetchData} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : data && data.stats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.stats.map((stat) => (
              <MetricCard key={stat.metricName} stat={stat} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No web vitals data available for this time period.</p>
                <p className="text-sm text-slate-500 mt-2">
                  Visit pages in your application to start collecting metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Page Breakdown */}
        {data && data.pageBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Page-Level Performance</CardTitle>
              <CardDescription>
                Web Vitals breakdown by page (top pages by sample count)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Group by page */}
                {Array.from(new Set(data.pageBreakdown.map(p => p.page))).slice(0, 10).map((page) => {
                  const pageMetrics = data.pageBreakdown.filter(p => p.page === page);
                  const totalSamples = pageMetrics.reduce((sum, m) => sum + m.count, 0);
                  const poorSamples = pageMetrics.reduce((sum, m) => sum + m.poorCount, 0);
                  const poorPercentage = (poorSamples / totalSamples) * 100;

                  return (
                    <div key={page} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-medium text-slate-900">{page}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {totalSamples} samples
                          </Badge>
                          {poorPercentage > 20 && (
                            <Badge variant="destructive" className="text-xs">
                              {poorPercentage.toFixed(0)}% poor
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        {pageMetrics.map((metric) => {
                          const rating = getMetricRating(metric.avgValue, metric.metricName);
                          return (
                            <div key={metric.metricName} className="text-center">
                              <div className="font-medium text-slate-700">{metric.metricName}</div>
                              <div className={`font-semibold ${
                                rating === 'good' ? 'text-green-600' :
                                rating === 'needs-improvement' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {formatMetricValue(metric.avgValue, metric.metricName)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Core Web Vitals</strong> are Google's metrics for measuring user experience.
                  We track the 75th percentile (p75) as the primary metric, which aligns with Google's
                  "good" threshold recommendations.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>LCP</strong> should be &lt; 2.5s for good experience</li>
                  <li><strong>FCP</strong> should be &lt; 1.8s for good experience</li>
                  <li><strong>CLS</strong> should be &lt; 0.1 for good experience</li>
                  <li><strong>INP</strong> should be &lt; 200ms for good experience</li>
                  <li><strong>TTFB</strong> should be &lt; 800ms for good experience</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
