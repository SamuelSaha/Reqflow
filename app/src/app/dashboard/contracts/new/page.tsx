"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDirtyFormGuard } from "@/hooks/useDirtyFormGuard";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/api/react";
import { Loader2, ChevronLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const contractFormSchema = z.object({
  vendorId: z.string().uuid("Please select a vendor"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  contractNumber: z.string().optional(),
  type: z.enum(["subscription", "service", "license", "framework"]),
  status: z.enum(["draft", "active"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  autoRenew: z.boolean(),
  renewalDate: z.string().optional(),
  noticePeriodDays: z.number().optional(),
  upliftCap: z.number().optional(),
  totalValue: z.string().optional(),
  currency: z.string().default("EUR"),
  paymentTerms: z.string().optional(),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

export default function NewContractPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datesOpen, setDatesOpen] = useState(true);
  const [financialOpen, setFinancialOpen] = useState(false);
  const router = useRouter();

  const vendors = trpc.vendors.list.useQuery({});

  const form = useForm<ContractFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contractFormSchema) as any,
    defaultValues: {
      title: "",
      contractNumber: "",
      type: "subscription",
      status: "draft",
      startDate: "",
      endDate: "",
      autoRenew: false,
      renewalDate: "",
      currency: "EUR",
      paymentTerms: "",
    },
  });

  const { confirmNavigation } = useDirtyFormGuard(form.formState.isDirty);

  const createContract = trpc.contracts.create.useMutation();

  async function onSubmit(data: ContractFormValues) {
    setIsSubmitting(true);
    try {
      const contract = await createContract.mutateAsync({
        ...data,
        noticePeriodDays: data.noticePeriodDays || undefined,
        upliftCap: data.upliftCap || undefined,
      });

      toast.success("Contract created!", {
        description: `${contract.title} has been created successfully.`,
      });

      router.push(`/dashboard/contracts/${contract.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast.error("Failed to create contract", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => confirmNavigation(() => router.push("/dashboard/contracts"))}
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Contracts
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          New Contract
        </h1>
        <p className="text-slate-600 mt-2">
          Create a contract with notice deadline tracking
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>
                Core contract information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.data?.vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Slack Enterprise Agreement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contractNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Number (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CNT-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormMessage />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Start as draft to review before marking active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dates & Renewal */}
          <Collapsible open={datesOpen} onOpenChange={setDatesOpen}>
          <Card>
            <CollapsibleTrigger className="w-full text-left">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>Dates & Renewal Terms</CardTitle>
                  <CardDescription>
                    When does this contract start, end, and renew?
                  </CardDescription>
                </div>
                <ChevronDown className={cn("h-4 w-4 mt-1 text-slate-400 transition-transform duration-200", datesOpen && "rotate-180")} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
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
                      <FormLabel>End Date (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="autoRenew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Auto-renew enabled
                      </FormLabel>
                      <FormDescription>
                        Contract automatically renews unless cancelled
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="renewalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renewal Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When does this contract renew?
                      </FormDescription>
                      <FormMessage />
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
                          placeholder="e.g., 30, 60, 90"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Days before renewal to give notice
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="upliftCap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uplift Cap % (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 5.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum price increase percentage on renewal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            </CollapsibleContent>
          </Card>
          </Collapsible>

          {/* Financial */}
          <Collapsible open={financialOpen} onOpenChange={setFinancialOpen}>
          <Card>
            <CollapsibleTrigger className="w-full text-left">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>Financial Terms</CardTitle>
                  <CardDescription>
                    Contract value and payment details
                    {!financialOpen && <span className="ml-2 text-slate-400">(optional)</span>}
                  </CardDescription>
                </div>
                <ChevronDown className={cn("h-4 w-4 mt-1 text-slate-400 transition-transform duration-200", financialOpen && "rotate-180")} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="totalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Value (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g., 50000.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Net 30, Annual upfront, Monthly in arrears"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            </CollapsibleContent>
          </Card>
          </Collapsible>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Contract...
                </>
              ) : (
                "Create Contract"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
