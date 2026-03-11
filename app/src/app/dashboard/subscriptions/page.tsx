"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  Building2,
  Package,
  Loader2,
  Edit3,
} from "lucide-react";
import { trpc } from "@/lib/api/react";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyBoxIllustration } from "@/components/ui/illustrations";
import { VendorAvatar } from "@/components/ui/vendor-avatar";

const statusColors = {
  trial: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-amber-100 text-amber-800",
  cancelled: "bg-slate-100 text-slate-600",
  expired: "bg-red-100 text-red-800",
};

const categoryColors = {
  saas: "bg-violet-100 text-violet-800",
  services: "bg-blue-100 text-blue-800",
  infrastructure: "bg-slate-100 text-slate-700",
  office: "bg-green-100 text-green-800",
  other: "bg-gray-100 text-gray-700",
};

type CategoryData = { monthly: number; annual: number; count: number };
type VendorData = { monthly: number; annual: number; count: number; vendorName: string };
type DepartmentData = { monthly: number; annual: number; count: number; departmentName: string };
type UtilizationItem = {
  subscription: {
    id: string;
    toolName: string;
    status: string;
  };
  seats: number;
  activeSeats: number;
  utilizationPercent: number;
  wastedSeats: number;
  wastedCost: number;
};
type SubscriptionItem = {
  id: string;
  toolName: string;
  status: string;
  category: string;
  totalCost: string;
  billingCycle: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  seats?: number | null;
  activeSeats?: number | null;
  vendor?: { name: string } | null;
  department?: { name: string } | null;
};

export default function SubscriptionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  // Fetch subscriptions — primary data, drives the list
  const { data: subscriptions, isLoading: subsLoading, isError: subsError } = trpc.subscriptions.list.useQuery({
    status: statusFilter as "trial" | "active" | "paused" | "cancelled" | "expired",
    category: categoryFilter,
  });

  // Fetch spend metrics — secondary, loads independently
  const { data: metrics, isLoading: metricsLoading } = trpc.subscriptions.spendMetrics.useQuery(
    { status: ["active", "trial"] },
    { retry: 1 }
  );

  // Fetch seat utilization — secondary, loads independently
  const { data: utilization } = trpc.subscriptions.seatUtilization.useQuery(
    { threshold: 50 },
    { retry: 1 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display-sm font-semibold text-slate-900">Subscriptions</h1>
        <p className="text-body-md text-slate-600 mt-1">
          Track active subscriptions, monitor spend, and optimize seat usage
        </p>
      </div>

      {/* Metrics Overview */}
      {metricsLoading && !metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-3"></div>
                <div className="h-7 bg-slate-100 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                    €{metrics.totalMonthly.toLocaleString("en", { minimumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-600">Monthly Spend</p>
                </div>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-green-50">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">€{metrics.totalAnnual.toLocaleString("en", { minimumFractionDigits: 0 })} annually</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                    {metrics.subscriptionCount}
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-600">Active Subscriptions</p>
                </div>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">{Object.keys(metrics.byVendor).length} vendors</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${(utilization?.totalWastedCost || 0) > 0 ? "ring-2 ring-amber-200 bg-amber-50/20" : ""}`}>
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl font-bold tracking-tight text-amber-700">
                    €{(utilization?.totalWastedCost || 0).toLocaleString("en", { minimumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-600">Wasted Spend</p>
                </div>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">{utilization?.totalWastedSeats || 0} unused seats</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Seat Utilization Warnings */}
      {utilization && utilization.underutilized.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-body-lg text-amber-900">
                Seat Optimization Opportunities
              </CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              {utilization.underutilized.length} subscriptions have low seat utilization (&lt;{utilization.threshold}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {utilization.underutilized.slice(0, 5).map((item: UtilizationItem) => (
              <div
                key={item.subscription.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-body-sm font-semibold text-slate-900">
                      {item.subscription.toolName}
                    </p>
                    <Badge variant="pill" className={statusColors[item.subscription.status as keyof typeof statusColors]}>
                      {item.subscription.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-caption text-slate-600">
                    <span>
                      {item.activeSeats} / {item.seats} seats used ({item.utilizationPercent.toFixed(0)}%)
                    </span>
                    <span className="text-amber-600 font-medium">
                      €{item.wastedCost.toFixed(2)}/mo wasted
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/subscriptions/${item.subscription.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Optimize
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-body-lg">All Subscriptions</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter || "all"} onValueChange={(v) => setCategoryFilter(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {subsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          )}

          {!subsLoading && subsError && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <AlertTriangle className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">Failed to load subscriptions.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {!subsLoading && !subsError && subscriptions && subscriptions.length === 0 && (
            <EmptyState
              illustration={<EmptyBoxIllustration className="w-32 h-32" />}
              title={
                statusFilter !== "active" || categoryFilter
                  ? "No subscriptions match these filters"
                  : "No subscriptions yet"
              }
              description={
                statusFilter !== "active" || categoryFilter
                  ? "Try adjusting your filters to see more results."
                  : "Subscriptions are created automatically when a purchase request is approved. Start by submitting a request for a new tool or service."
              }
              action={
                statusFilter === "active" && !categoryFilter
                  ? { label: "Create a Request", href: "/dashboard/requests/new" }
                  : undefined
              }
              secondaryAction={
                statusFilter !== "active" || categoryFilter
                  ? {
                      label: "Clear filters",
                      onClick: () => {
                        setStatusFilter("active");
                        setCategoryFilter(undefined);
                      },
                    }
                  : undefined
              }
            />
          )}

          {!subsLoading && !subsError && subscriptions && subscriptions.length > 0 && (
            <div className="space-y-3">
              {subscriptions.map((sub: SubscriptionItem) => {
                const monthlyCost = sub.billingCycle === "monthly"
                  ? parseFloat(sub.totalCost)
                  : sub.billingCycle === "quarterly"
                  ? parseFloat(sub.totalCost) / 3
                  : parseFloat(sub.totalCost) / 12;

                return (
                  <div
                    key={sub.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex gap-3 flex-1">
                      <VendorAvatar name={sub.vendor?.name || sub.toolName} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-body-md font-semibold text-slate-900">
                            {sub.toolName}
                          </h3>
                          <Badge variant="pill" className={statusColors[sub.status as keyof typeof statusColors]}>
                            {sub.status}
                          </Badge>
                          <Badge variant="pill" className={categoryColors[sub.category as keyof typeof categoryColors]}>
                            {sub.category}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-caption text-slate-600">
                          {sub.vendor && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {sub.vendor.name}
                            </span>
                          )}
                          {sub.department && (
                            <span>{sub.department.name}</span>
                          )}
                          {sub.seats && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {sub.activeSeats || 0} / {sub.seats} seats
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(sub.startDate).toLocaleDateString()}
                            {sub.endDate && ` - ${new Date(sub.endDate).toLocaleDateString()}`}
                          </span>
                        </div>

                        {sub.description && (
                          <p className="text-caption text-slate-500 mt-2">
                            {sub.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-body-lg font-bold text-slate-900">
                        €{parseFloat(sub.totalCost).toLocaleString("en", { minimumFractionDigits: 2 })}
                      </div>
                      <p className="text-caption text-slate-500">
                        per {sub.billingCycle === "monthly" ? "month" : sub.billingCycle === "quarterly" ? "quarter" : "year"}
                      </p>
                      <p className="text-caption text-slate-400 mt-1">
                        €{monthlyCost.toFixed(2)}/mo
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spend Breakdown Tabs */}
      {metrics && (
        <Tabs defaultValue="category" className="w-full">
          <TabsList>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="vendor">By Vendor</TabsTrigger>
            <TabsTrigger value="department">By Department</TabsTrigger>
          </TabsList>

          <TabsContent value="category" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-body-lg">Spend by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.byCategory).map(([category, data]: [string, CategoryData]) => (
                    <div key={category} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Badge variant="pill" className={categoryColors[category as keyof typeof categoryColors]}>
                          {category}
                        </Badge>
                        <span className="text-caption text-slate-600">{data.count} subscriptions</span>
                      </div>
                      <div className="text-right">
                        <div className="text-body-md font-semibold text-slate-900">
                          €{data.monthly.toLocaleString("en", { minimumFractionDigits: 2 })}/mo
                        </div>
                        <div className="text-caption text-slate-500">
                          €{data.annual.toLocaleString("en", { minimumFractionDigits: 2 })}/yr
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendor" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-body-lg">Spend by Vendor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.byVendor)
                    .sort(([, a]: [string, VendorData], [, b]: [string, VendorData]) => b.monthly - a.monthly)
                    .map(([vendorId, data]: [string, VendorData]) => (
                      <div key={vendorId} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="text-body-sm font-medium text-slate-900">{data.vendorName}</div>
                            <div className="text-caption text-slate-600">{data.count} subscriptions</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-body-md font-semibold text-slate-900">
                            €{data.monthly.toLocaleString("en", { minimumFractionDigits: 2 })}/mo
                          </div>
                          <div className="text-caption text-slate-500">
                            €{data.annual.toLocaleString("en", { minimumFractionDigits: 2 })}/yr
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="department" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-body-lg">Spend by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.byDepartment)
                    .sort(([, a]: [string, DepartmentData], [, b]: [string, DepartmentData]) => b.monthly - a.monthly)
                    .map(([deptId, data]: [string, DepartmentData]) => (
                      <div key={deptId} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-body-sm font-medium text-slate-900">{data.departmentName}</div>
                            <div className="text-caption text-slate-600">{data.count} subscriptions</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-body-md font-semibold text-slate-900">
                            €{data.monthly.toLocaleString("en", { minimumFractionDigits: 2 })}/mo
                          </div>
                          <div className="text-caption text-slate-500">
                            €{data.annual.toLocaleString("en", { minimumFractionDigits: 2 })}/yr
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
