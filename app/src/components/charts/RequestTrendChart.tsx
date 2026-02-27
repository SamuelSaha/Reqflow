"use client";

/**
 * Lazy-loaded Chart Components
 * Separated for code splitting - Recharts is a heavy dependency
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/dashboard/LoadingSkeletons";

/**
 * Request trend line chart
 */
export function RequestTrendChart({
  data,
  height = 300,
}: {
  data: Array<{ date: string; count: number }>;
  height?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-body">Request Volume (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading state for chart
 */
export function RequestTrendChartSkeleton() {
  return <ChartSkeleton height={300} />;
}
