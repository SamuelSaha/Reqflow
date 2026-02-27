"use client";

/**
 * Lazy-loaded Dashboard Stats Wrapper
 * This file provides the dynamic import for DashboardStats
 */

import dynamic from "next/dynamic";
import { StatsCardSkeleton } from "@/components/dashboard/LoadingSkeletons";

/**
 * Lazy wrapper for dashboard stats with Suspense
 */
export const LazyDashboardStats = dynamic(
  () => import("./LazyDashboardStats").then((mod) => mod.DashboardStats),
  {
    loading: () => <StatsCardSkeleton count={5} />,
    ssr: false,
  }
);
