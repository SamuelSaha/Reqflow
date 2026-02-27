"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/api/react";
import { Loader2, FlaskConical, Plus, X, FileText, Save } from "lucide-react";
import { addDays, format } from "date-fns";
import { TemplatePickerDialog } from "./TemplatePickerDialog";
import { SaveTemplateDialog } from "./SaveTemplateDialog";
import type { RequestTemplateData } from "@/lib/db/schema/request-templates";

const requestFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.enum(["saas", "services", "office", "travel", "hardware", "other"]),
  vendorName: z.string().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount"),
  frequency: z.enum(["one-time", "monthly", "annually"]),
  quantity: z.number().min(1).optional(),
  urgency: z.enum(["low", "normal", "urgent"]).optional(),
  // Trial fields
  isTrial: z.boolean().optional(),
  trialEndDate: z.string().optional(),
  trialSuccessCriteria: z.array(z.object({
    metric: z.string(),
    target: z.string(),
  })).optional(),
  trialEstimatedAnnualCost: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const router = useRouter();

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
      isTrial: false,
      trialEndDate: format(addDays(new Date(), 14), "yyyy-MM-dd"),
      trialSuccessCriteria: [{ metric: "", target: "" }],
      trialEstimatedAnnualCost: "",
    },
  });

  const createRequest = trpc.requests.create.useMutation();
  const submitRequest = trpc.requests.submit.useMutation();
  const createTrial = trpc.trials.createFromRequest.useMutation();
  const incrementTemplateUse = trpc.templates.incrementUseCount.useMutation();

  // Handle template selection - pre-fill form with template data
  const handleSelectTemplate = (templateData: RequestTemplateData, templateId: string) => {
    setSelectedTemplateId(templateId);

    // Pre-fill form fields from template
    if (templateData.title) form.setValue("title", templateData.title);
    if (templateData.description) form.setValue("description", templateData.description);
    if (templateData.category) form.setValue("category", templateData.category);
    if (templateData.vendorName) form.setValue("vendorName", templateData.vendorName);
    if (templateData.amount) form.setValue("amount", templateData.amount);
    if (templateData.frequency) form.setValue("frequency", templateData.frequency);
    if (templateData.quantity) form.setValue("quantity", templateData.quantity);
    if (templateData.urgency) form.setValue("urgency", templateData.urgency);
    if (templateData.isTrial !== undefined) form.setValue("isTrial", templateData.isTrial);
    if (templateData.trialEndDate) form.setValue("trialEndDate", templateData.trialEndDate);
    if (templateData.trialSuccessCriteria) form.setValue("trialSuccessCriteria", templateData.trialSuccessCriteria);
    if (templateData.trialEstimatedAnnualCost) form.setValue("trialEstimatedAnnualCost", templateData.trialEstimatedAnnualCost);

    toast.success("Template loaded", {
      description: "Form pre-filled with template data",
    });
  };

  // Handle saving current form as template
  const handleSaveAsTemplate = () => {
    const currentValues = form.getValues();

    // Generate suggested name from title + vendor
    const suggestedName = [
      currentValues.category,
      currentValues.vendorName,
      currentValues.title,
    ]
      .filter(Boolean)
      .join(" - ")
      .slice(0, 50);

    setSaveTemplateOpen(true);
  };

  async function onSubmit(data: RequestFormValues) {
    setIsSubmitting(true);
    try {
      // Increment template use count if template was used
      if (selectedTemplateId) {
        incrementTemplateUse.mutate({ id: selectedTemplateId });
      }

      if (data.isTrial) {
        // Trial mode: Create trial with request
        if (!data.trialEndDate) {
          toast.error("Trial end date is required");
          return;
        }

        await createTrial.mutateAsync({
          title: data.title,
          description: data.description,
          category: data.category,
          vendorName: data.vendorName,
          amount: data.amount,
          frequency: data.frequency,
          urgency: data.urgency,
          trialEndDate: data.trialEndDate,
          trialSuccessCriteria: data.trialSuccessCriteria?.filter(c => c.metric && c.target),
          trialEstimatedAnnualCost: data.trialEstimatedAnnualCost,
        });

        toast.success("Trial created!", {
          description: `Trial ends on ${format(new Date(data.trialEndDate), "MMM d, yyyy")}. Reminders scheduled.`,
          duration: 5000,
        });

        // Navigate to trials dashboard
        router.push("/dashboard/trials");
      } else {
        // Regular request mode
        const request = await createRequest.mutateAsync(data);
        const result = await submitRequest.mutateAsync({ id: request.id });

        toast.success("Request submitted!", {
          description: `${request.requestNumber} routed to ${result.approvalSteps} approver${result.approvalSteps !== 1 ? 's' : ''}`,
          duration: 5000,
        });

        if (result.flags && Object.values(result.flags).some(v => v === true)) {
          const flagMessages = [];
          if (result.flags.securityReview) flagMessages.push("Security review required");
          if (result.flags.legalReview) flagMessages.push("Legal review required");
          if (result.flags.budgetEscalation) flagMessages.push("Budget escalation triggered");
          if (result.flags.budgetOverrun) flagMessages.push("⚠️ Would exceed budget");

          if (flagMessages.length > 0) {
            toast.info(result.workflowName, {
              description: flagMessages.join(" • "),
              duration: 7000,
            });
          }
        }

        router.push(`/dashboard/requests/${request.id}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast.error(`Failed to ${data.isTrial ? "create trial" : "submit request"}`, {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Template actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTemplatePickerOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Use Template
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsTemplate}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          </div>

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

        {/* Trial Mode Toggle */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="isTrial"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 flex items-center gap-2 cursor-pointer">
                      <FlaskConical className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">This is a trial</span>
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
            {form.watch("isTrial") && (
              <CardDescription className="text-blue-700">
                Track tool trials and get reminders before they expire
              </CardDescription>
            )}
          </CardHeader>

          {form.watch("isTrial") && (
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="trialEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trial End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      You'll receive reminders 7, 3, and 1 days before expiry
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trialEstimatedAnnualCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Annual Cost (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., €2,400" {...field} />
                    </FormControl>
                    <FormDescription>
                      If trial converts, this helps with budget planning
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Success Criteria (Optional)</FormLabel>
                <FormDescription className="text-sm">
                  What needs to happen for this trial to be worth converting?
                </FormDescription>
                {form.watch("trialSuccessCriteria")?.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`trialSuccessCriteria.${index}.metric`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Metric (e.g., Team adoption)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`trialSuccessCriteria.${index}.target`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Target (e.g., 5+ users)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const current = form.getValues("trialSuccessCriteria") || [];
                          form.setValue(
                            "trialSuccessCriteria",
                            current.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = form.getValues("trialSuccessCriteria") || [];
                    form.setValue("trialSuccessCriteria", [
                      ...current,
                      { metric: "", target: "" },
                    ]);
                  }}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add criterion
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {form.watch("isTrial") ? "Creating Trial..." : "Submitting Request..."}
              </>
            ) : (
              form.watch("isTrial") ? "Create Trial" : "Submit for Approval"
            )}
          </Button>
        </div>
      </form>
    </Form>

    {/* Template Picker Dialog */}
    <TemplatePickerDialog
      open={templatePickerOpen}
      onOpenChange={setTemplatePickerOpen}
      onSelectTemplate={handleSelectTemplate}
    />

    {/* Save Template Dialog */}
    <SaveTemplateDialog
      open={saveTemplateOpen}
      onOpenChange={setSaveTemplateOpen}
      templateData={form.getValues()}
      suggestedName={
        [
          form.watch("category"),
          form.watch("vendorName"),
          form.watch("title"),
        ]
          .filter(Boolean)
          .join(" - ")
          .slice(0, 50)
      }
    />
  </>
  );
}
