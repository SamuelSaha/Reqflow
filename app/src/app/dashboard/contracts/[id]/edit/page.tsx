"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/api/react";
import { Loader2, ChevronLeft, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const editSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  contractNumber: z.string().optional(),
  type: z.enum(["subscription", "service", "license", "framework"]),
  status: z.enum(["draft", "active", "expired", "cancelled", "renewed"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  autoRenew: z.boolean(),
  renewalDate: z.string().optional(),
  noticePeriodDays: z.coerce.number().optional(),
  totalValue: z.string().optional(),
  currency: z.string().default("EUR"),
  paymentTerms: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function ContractEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const contract = trpc.contracts.getById.useQuery({ id });

   
  const form = useForm<EditFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editSchema) as any,
    defaultValues: {
      title: "",
      contractNumber: "",
      type: "subscription",
      status: "draft",
      startDate: "",
      endDate: "",
      autoRenew: false,
      renewalDate: "",
      totalValue: "",
      currency: "EUR",
      paymentTerms: "",
    },
  });

  // Populate form when contract data loads
  useEffect(() => {
    if (contract.data) {
      const c = contract.data;
      form.reset({
        title: c.title,
        contractNumber: c.contractNumber || "",
        type: c.type as EditFormValues["type"],
        status: c.status as EditFormValues["status"],
        startDate: c.startDate || "",
        endDate: c.endDate || "",
        autoRenew: c.autoRenew || false,
        renewalDate: c.renewalDate || "",
        noticePeriodDays: c.noticePeriodDays ? parseFloat(c.noticePeriodDays) : undefined,
        totalValue: c.totalValue || "",
        currency: c.currency || "EUR",
        paymentTerms: c.paymentTerms || "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract.data]);

  const utils = trpc.useUtils();
  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => {
      utils.contracts.getById.invalidate({ id });
      utils.contracts.list.invalidate();
      toast.success("Contract updated successfully");
      router.push(`/dashboard/contracts/${id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  function onSubmit(values: EditFormValues) {
    updateMutation.mutate({ id, ...values });
  }

  if (contract.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (contract.isError || !contract.data) {
    return (
      <div className="max-w-3xl text-center py-16">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-slate-900">Contract not found</h2>
        <p className="text-sm text-slate-500 mt-2">
          This contract may have been deleted or you don&apos;t have permission to view it.
        </p>
        <Link href="/dashboard/contracts">
          <Button variant="outline" className="mt-6">Back to contracts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/contracts/${id}`}>
          <Button variant="ghost" size="icon" aria-label="Back to contract">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Contract</h1>
          <p className="text-sm text-slate-600 mt-1">
            Update details for {contract.data.title}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Slack Enterprise Agreement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contractNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CNT-2024-001" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="license">License</SelectItem>
                          <SelectItem value="framework">Framework</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="renewed">Renewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dates & Renewal */}
          <Card>
            <CardHeader>
              <CardTitle>Dates &amp; Renewal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="renewalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renewal Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="noticePeriodDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Period (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 30"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="autoRenew"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="autoRenew"
                      />
                    </FormControl>
                    <FormLabel htmlFor="autoRenew" className="cursor-pointer font-normal">
                      Auto-renews at end date
                    </FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financial Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Value</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Net 30" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link href={`/dashboard/contracts/${id}`}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
