"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { trpc } from "@/lib/api/react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const requestFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.enum(["saas", "services", "office", "travel", "hardware", "other"]),
  vendorName: z.string().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount"),
  frequency: z.enum(["one-time", "monthly", "annually"]),
  quantity: z.number().min(1).optional(),
  urgency: z.enum(["low", "normal", "urgent"]).optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export function RequestForm() {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "creating" | "submitting" | "success" | "error">("idle");
  const [routingResult, setRoutingResult] = useState<any>(null);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "saas",
      vendorName: "",
      amount: "",
      frequency: "one-time",
      quantity: 1,
      urgency: "normal",
    },
  });

  const createRequest = trpc.requests.create.useMutation();
  const submitRequest = trpc.requests.submit.useMutation();

  async function onSubmit(data: RequestFormValues) {
    try {
      // Step 1: Create draft request
      setSubmitStatus("creating");
      const request = await createRequest.mutateAsync(data);

      // Step 2: Submit for approval (triggers workflow engine)
      setSubmitStatus("submitting");
      const result = await submitRequest.mutateAsync({ id: request.id });

      setRoutingResult(result);
      setSubmitStatus("success");
    } catch (error) {
      console.error("Failed to submit request:", error);
      setSubmitStatus("error");
    }
  }

  if (submitStatus === "success" && routingResult) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-900">Request Submitted!</CardTitle>
          </div>
          <CardDescription className="text-green-700">
            Your purchase request has been routed for approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-green-900">Workflow:</p>
            <p className="text-sm text-green-700">{routingResult.workflowName}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-green-900">Approval Chain:</p>
            <p className="text-sm text-green-700">
              {routingResult.approvalSteps} approver{routingResult.approvalSteps !== 1 ? "s" : ""}
            </p>
          </div>

          {routingResult.flags && Object.entries(routingResult.flags).some(([key, value]) =>
            value === true && key !== "autoApproved"
          ) && (
            <div>
              <p className="text-sm font-medium text-green-900 mb-1">Flags:</p>
              <div className="space-y-1">
                {routingResult.flags.securityReview && (
                  <p className="text-xs text-green-700">🔒 Security review recommended</p>
                )}
                {routingResult.flags.legalReview && (
                  <p className="text-xs text-green-700">⚖️ Legal review recommended</p>
                )}
                {routingResult.flags.budgetEscalation && (
                  <p className="text-xs text-green-700">📊 Budget escalation triggered</p>
                )}
                {routingResult.flags.budgetOverrun && (
                  <p className="text-xs text-orange-700 font-medium">⚠️ Would exceed budget</p>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={() => {
              setSubmitStatus("idle");
              setRoutingResult(null);
              form.reset();
            }}
            className="w-full"
          >
            Create Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              What do you need to purchase?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Figma Professional subscription" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why do you need this? What problem does it solve?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="saas">SaaS / Software</SelectItem>
                        <SelectItem value="services">Services / Consulting</SelectItem>
                        <SelectItem value="office">Office Supplies</SelectItem>
                        <SelectItem value="travel">Travel & Events</SelectItem>
                        <SelectItem value="hardware">Hardware / Equipment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Figma, Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
            <CardDescription>
              How much does it cost?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (EUR)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("frequency") !== "one-time" && form.watch("amount") && (
              <p className="text-sm font-medium text-slate-600">
                Annual cost: €{(parseFloat(form.watch("amount") || "0") * (form.watch("frequency") === "monthly" ? 12 : 1)).toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitStatus !== "idle"}
            className="flex-1"
          >
            {submitStatus === "creating" && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Request...
              </>
            )}
            {submitStatus === "submitting" && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Routing for Approval...
              </>
            )}
            {submitStatus === "idle" && "Submit for Approval"}
          </Button>
        </div>

        {submitStatus === "error" && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-2 pt-6">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-900">
                Failed to submit request. Please try again.
              </p>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
