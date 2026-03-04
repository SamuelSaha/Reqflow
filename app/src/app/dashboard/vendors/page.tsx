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
import { Building2, Search, Plus } from "lucide-react";

import { SortableColumnHeader } from "@/components/ui/sortable-column-header";
import { DataPagination } from "@/components/ui/data-pagination";

type VendorSortOption = "name" | "annualSpend" | "activeSubscriptions" | "status";

const PAGE_SIZE = 20;

export default function VendorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string | undefined>();
  const [complianceTier, setComplianceTier] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<VendorSortOption>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const handleSort = (key: string) => {
    const k = key as VendorSortOption;
    if (sortBy === k) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(k);
      setSortOrder("asc");
    }
    setPage(0);
  };

  const { data, isLoading, error } = trpc.vendors.list.useQuery({
    search: search || undefined,
    industry,
    complianceTier,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Vendors</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">
            Manage your vendor directory and compliance
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => router.push("/dashboard/vendors/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
            <Select value={industry} onValueChange={(v) => { setIndustry(v); setPage(0); }}>
              <SelectTrigger className="md:w-[180px]">
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
            <Select value={complianceTier} onValueChange={(v) => { setComplianceTier(v); setPage(0); }}>
              <SelectTrigger className="md:w-[180px]">
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
        </div>
      </Card>

      {/* Table */}
      <Card>
        {data && data.vendors.length > 0 ? (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableColumnHeader label="Vendor" sortKey="name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                </TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>
                  <SortableColumnHeader label="Subscriptions" sortKey="activeSubscriptions" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader label="Annual Spend" sortKey="annualSpend" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader label="Status" sortKey="status" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...data.vendors].sort((a, b) => {
                const dir = sortOrder === "asc" ? 1 : -1;
                if (sortBy === "annualSpend") return (parseFloat(a.annualSpend) - parseFloat(b.annualSpend)) * dir;
                if (sortBy === "activeSubscriptions") return (a.activeSubscriptions - b.activeSubscriptions) * dir;
                if (sortBy === "status") return a.status.localeCompare(b.status) * dir;
                return a.name.localeCompare(b.name) * dir;
              }).map((vendor) => (
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
                      <span className="text-slate-400"> - </span>
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
          <DataPagination
            page={page}
            total={data.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
          </div>
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

    </div>
  );
}
