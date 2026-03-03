"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/api/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  Loader2,
  XCircle,
  Users,
  DollarSign,
  Calendar,
  Building2,
  AlertTriangle,
  Ban,
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusColors = {
  trial: "bg-blue-100 text-blue-700 border-blue-200",
  active: "bg-green-100 text-green-700 border-green-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  expired: "bg-red-100 text-red-700 border-red-200",
};

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const subscription = trpc.subscriptions.getById.useQuery({ id });

  const [editSeats, setEditSeats] = useState<string>("");
  const [editActiveSeats, setEditActiveSeats] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const utils = trpc.useUtils();
  const updateMutation = trpc.subscriptions.update.useMutation({
    onSuccess: () => {
      utils.subscriptions.getById.invalidate({ id });
      utils.subscriptions.list.invalidate();
      utils.subscriptions.seatUtilization.invalidate();
      toast.success("Subscription updated");
      setIsEditing(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.subscriptions.cancel.useMutation({
    onSuccess: () => {
      utils.subscriptions.getById.invalidate({ id });
      utils.subscriptions.list.invalidate();
      utils.subscriptions.seatUtilization.invalidate();
      toast.success("Subscription cancelled");
      setCancelOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  function startEditing() {
    if (!subscription.data) return;
    setEditSeats(subscription.data.seats?.toString() || "");
    setEditActiveSeats(subscription.data.activeSeats?.toString() || "");
    setEditStatus(subscription.data.status);
    setIsEditing(true);
  }

  function handleSave() {
    updateMutation.mutate({
      id,
      data: {
        seats: editSeats ? parseInt(editSeats) : undefined,
        activeSeats: editActiveSeats ? parseInt(editActiveSeats) : undefined,
        status: editStatus as "trial" | "active" | "paused" | "cancelled" | "expired",
      },
    });
  }

  if (subscription.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (subscription.isError || !subscription.data) {
    return (
      <div className="max-w-3xl text-center py-16">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-slate-900">Subscription not found</h2>
        <Link href="/dashboard/subscriptions">
          <Button variant="outline" className="mt-6">Back to subscriptions</Button>
        </Link>
      </div>
    );
  }

  const sub = subscription.data;
  const monthlyCost =
    sub.billingCycle === "monthly"
      ? parseFloat(sub.totalCost)
      : sub.billingCycle === "quarterly"
      ? parseFloat(sub.totalCost) / 3
      : parseFloat(sub.totalCost) / 12;

  const utilizationPercent =
    sub.seats && sub.activeSeats !== null && sub.activeSeats !== undefined
      ? Math.round((sub.activeSeats / sub.seats) * 100)
      : null;

  const isUnderutilized = utilizationPercent !== null && utilizationPercent < 50;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/subscriptions">
          <Button variant="ghost" size="icon" aria-label="Back to subscriptions">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{sub.toolName}</h1>
            <Badge
              className={statusColors[sub.status as keyof typeof statusColors]}
              variant="outline"
            >
              {sub.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{sub.category}</p>
        </div>
      </div>

      {/* Underutilization warning */}
      {isUnderutilized && !isEditing && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Low seat utilization</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Only {utilizationPercent}% of seats are in use. Consider reducing your seat count to
              save{" "}
              <strong>
                €
                {(
                  ((sub.seats! - sub.activeSeats!) / sub.seats!) *
                  monthlyCost
                ).toFixed(2)}
                /mo
              </strong>
              .
            </p>
          </div>
          <Button size="sm" onClick={startEditing} className="flex-shrink-0">
            Optimize Now
          </Button>
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Monthly cost</span>
            </div>
            <p className="text-xl font-bold text-slate-900">
              €{monthlyCost.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Seat usage</span>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {sub.activeSeats ?? "—"} / {sub.seats ?? "—"}
            </p>
            {utilizationPercent !== null && (
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    utilizationPercent >= 60
                      ? "bg-green-500"
                      : utilizationPercent >= 30
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Billing</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 capitalize">
              {sub.billingCycle}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Started</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(sub.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization editor */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Optimize Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seats">Total Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  min={1}
                  value={editSeats}
                  onChange={(e) => setEditSeats(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activeSeats">Active Seats</Label>
                <Input
                  id="activeSeats"
                  type="number"
                  min={0}
                  value={editActiveSeats}
                  onChange={(e) => setEditActiveSeats(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Details</CardTitle>
            <div className="flex items-center gap-2">
              {sub.status !== "cancelled" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setCancelOpen(true)}
                >
                  <Ban className="h-3.5 w-3.5 mr-1.5" />
                  Cancel
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={startEditing}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {sub.description && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Description</dt>
                  <dd className="text-sm text-slate-900">{sub.description}</dd>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Cost</dt>
                  <dd className="text-sm font-semibold text-slate-900">
                    €{parseFloat(sub.totalCost).toLocaleString("en", { minimumFractionDigits: 2 })}{" "}
                    <span className="text-slate-400 font-normal">/{sub.billingCycle}</span>
                  </dd>
                </div>
                {sub.endDate && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">End Date</dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {new Date(sub.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                )}
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Back link */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>
              This will cancel <strong>{sub.toolName}</strong> and set the end date to today.
              Historical data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate({ id })}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Yes, cancel it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
