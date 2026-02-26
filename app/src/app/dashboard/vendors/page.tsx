"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Search, Plus, Loader2 } from "lucide-react";

export default function VendorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string | undefined>();
  const [complianceTier, setComplianceTier] = useState<string | undefined>();

  const { data, isLoading, error } = trpc.vendors.list.useQuery({
    search: search || undefined,
    industry,
    complianceTier,
    limit: 50,
    offset: 0,
  });

  const complianceTierColors = {
    none: "bg-slate-100 text-slate-700",
    basic: "bg-blue-100 text-blue-700",
    customer_data: "bg-yellow-100 text-yellow-700",
    regulated: "bg-purple-100 text-purple-700",
  };

  const statusColors = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-slate-100 text-slate-700",
    blocked: "bg-red-100 text-red-700",
    pending_review: "bg-yellow-100 text-yellow-700",
  };

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <p className="text-red-600">Failed to load vendors</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Vendors</h1>
          <p className="text-slate-600 mt-1">
            Manage your vendor directory and compliance
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/vendors/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="saas">SaaS</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
            </SelectContent>
          </Select>
          <Select value={complianceTier} onValueChange={setComplianceTier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Compliance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="customer_data">Customer Data</SelectItem>
              <SelectItem value="regulated">Regulated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
            <p className="text-slate-600 mt-2">Loading vendors...</p>
          </div>
        ) : data && data.vendors.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Subscriptions</TableHead>
                <TableHead>Annual Spend</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.vendors.map((vendor) => (
                <TableRow
                  key={vendor.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {vendor.name}
                        </div>
                        {vendor.legalName && vendor.legalName !== vendor.name && (
                          <div className="text-sm text-slate-500">
                            {vendor.legalName}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {vendor.industry ? (
                      <span className="capitalize">{vendor.industry}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        complianceTierColors[
                          vendor.complianceTier as keyof typeof complianceTierColors
                        ]
                      }
                      variant="secondary"
                    >
                      {vendor.complianceTier.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-slate-900">
                      {vendor.activeSubscriptions}
                      {vendor.totalSubscriptions > vendor.activeSubscriptions && (
                        <span className="text-slate-500">
                          {" "}
                          / {vendor.totalSubscriptions}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      €{parseFloat(vendor.annualSpend).toLocaleString("en", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[
                          vendor.status as keyof typeof statusColors
                        ]
                      }
                      variant="secondary"
                    >
                      {vendor.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mt-4">
              No vendors yet
            </h3>
            <p className="text-slate-600 mt-1">
              Add your first vendor to start tracking spend and compliance
            </p>
            <Button
              onClick={() => router.push("/dashboard/vendors/new")}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {data && data.total > 50 && (
        <div className="text-center text-sm text-slate-600">
          Showing {data.vendors.length} of {data.total} vendors
        </div>
      )}
    </div>
  );
}
