"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/api/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  ArrowLeft,
  FileText,
  Loader2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

export default function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editTier, setEditTier] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.vendors.get.useQuery({ id });

  const updateMutation = trpc.vendors.update.useMutation({
    onSuccess: () => {
      utils.vendors.get.invalidate({ id });
      utils.vendors.list.invalidate();
      toast.success("Vendor updated");
      setEditOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  function openEdit() {
    if (!data) return;
    const v = data.vendor;
    setEditName(v.name);
    setEditWebsite(v.website || "");
    setEditIndustry(v.industry || "");
    setEditCountry(v.country || "");
    setEditStatus(v.status);
    setEditTier(v.complianceTier);
    setEditNotes(v.internalNotes || "");
    setEditOpen(true);
  }

  function handleSave() {
    updateMutation.mutate({
      id,
      name: editName || undefined,
      website: editWebsite || undefined,
      industry: editIndustry || undefined,
      country: editCountry || undefined,
      status: editStatus as "active" | "inactive" | "blocked" | "pending_review",
      complianceTier: editTier as "none" | "basic" | "customer_data" | "regulated",
      internalNotes: editNotes || undefined,
    });
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <p className="text-red-600">Failed to load vendor</p>
          <Button onClick={() => router.push("/dashboard/vendors")} className="mt-4">
            Back to Vendors
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
          <p className="text-slate-600 mt-2">Loading vendor...</p>
        </div>
      </div>
    );
  }

  const { vendor, subscriptions, contracts, metrics } = data;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {vendor.name}
            </h1>
            {vendor.legalName && vendor.legalName !== vendor.name && (
              <p className="text-slate-600 mt-1">{vendor.legalName}</p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={openEdit}>Edit Vendor</Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Annual Spend</div>
              <div className="text-2xl font-semibold text-slate-900">
                €{parseFloat(metrics.annualSpend).toLocaleString("en", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Active Subscriptions</div>
              <div className="text-2xl font-semibold text-slate-900">
                {metrics.activeSubscriptions}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Contracts</div>
              <div className="text-2xl font-semibold text-slate-900">
                {contracts.length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">
            Subscriptions ({subscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="contracts">
            Contracts ({contracts.length})
          </TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Vendor Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-slate-600 mb-1">Legal Name</div>
                <div className="text-slate-900">
                  {vendor.legalName || " - "}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Industry</div>
                <div className="text-slate-900 capitalize">
                  {vendor.industry || " - "}
                </div>
              </div>
              {vendor.website && (
                <div>
                  <div className="text-sm text-slate-600 mb-1">Website</div>
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    {vendor.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              <div>
                <div className="text-sm text-slate-600 mb-1">Country</div>
                <div className="text-slate-900">{vendor.country || " - "}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Tax ID</div>
                <div className="text-slate-900">{vendor.taxId || " - "}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Status</div>
                <Badge variant="secondary">{vendor.status}</Badge>
              </div>
            </div>
          </Card>

          {vendor.primaryContact && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Primary Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{vendor.primaryContact.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a
                    href={`mailto:${vendor.primaryContact.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {vendor.primaryContact.email}
                  </a>
                </div>
                {vendor.primaryContact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{vendor.primaryContact.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subscriptions">
          {subscriptions.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool Name</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.toolName}
                      </TableCell>
                      <TableCell>{sub.plan || " - "}</TableCell>
                      <TableCell>
                        {sub.seats ? `${sub.activeSeats || 0} / ${sub.seats}` : " - "}
                      </TableCell>
                      <TableCell>
                        €{parseFloat(sub.totalCost).toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {sub.billingCycle}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sub.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mt-4">
                No subscriptions
              </h3>
              <p className="text-slate-600 mt-1">
                No active subscriptions from this vendor yet
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contracts">
          {contracts.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.title}
                      </TableCell>
                      <TableCell className="capitalize">
                        {contract.type}
                      </TableCell>
                      <TableCell>
                        {new Date(contract.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {contract.renewalDate
                          ? new Date(contract.renewalDate).toLocaleDateString()
                          : " - "}
                      </TableCell>
                      <TableCell>
                        {contract.totalValue
                          ? `€${parseFloat(contract.totalValue).toLocaleString()}`
                          : " - "}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{contract.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mt-4">
                No contracts
              </h3>
              <p className="text-slate-600 mt-1">
                No contracts with this vendor yet
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Compliance Status
              </h3>
              <Badge variant="secondary" className="capitalize">
                {vendor.complianceTier.replace("_", " ")}
              </Badge>
            </div>
            {vendor.complianceDocs && vendor.complianceDocs.length > 0 ? (
              <div className="space-y-3">
                {vendor.complianceDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900">
                          {doc.name}
                        </div>
                        <div className="text-sm text-slate-600">
                          {doc.type}
                          {doc.expiresAt && (
                            <span> • Expires {new Date(doc.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-slate-600 mt-2">No compliance documents uploaded</p>
                <Button className="mt-4" variant="outline">
                  Upload Document
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editName">Name *</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="editWebsite">Website</Label>
                <Input
                  id="editWebsite"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCountry">Country</Label>
                <Input
                  id="editCountry"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editIndustry">Industry</Label>
              <Input
                id="editIndustry"
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger id="editStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTier">Compliance Tier</Label>
                <Select value={editTier} onValueChange={setEditTier}>
                  <SelectTrigger id="editTier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="customer_data">Customer Data</SelectItem>
                    <SelectItem value="regulated">Regulated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editNotes">Internal Notes</Label>
              <textarea
                id="editNotes"
                className="w-full text-sm border border-slate-200 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Internal notes about this vendor..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!editName.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
