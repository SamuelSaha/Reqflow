"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { trpc } from "@/lib/api/react";
import { format, addDays } from "date-fns";

const decisionSchema = z.object({
  decision: z.enum(["convert", "extend", "cancel"]),
  decisionNotes: z.string().optional(),
  newEndDate: z.string().optional(),
}).refine(
  (data) => {
    // Require newEndDate if extending
    if (data.decision === "extend" && !data.newEndDate) {
      return false;
    }
    // Require notes if cancelling
    if (data.decision === "cancel" && !data.decisionNotes?.trim()) {
      return false;
    }
    return true;
  },
  {
    message: "Required field missing",
    path: ["decision"],
  }
);

type DecisionFormValues = z.infer<typeof decisionSchema>;

interface TrialDecisionModalProps {
  trialId: string;
  toolName: string;
  endDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TrialDecisionModal({
  trialId,
  toolName,
  endDate,
  open,
  onOpenChange,
  onSuccess,
}: TrialDecisionModalProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: {
      decision: "convert",
      decisionNotes: "",
      newEndDate: format(addDays(new Date(endDate), 30), "yyyy-MM-dd"),
    },
  });

  const makeDecision = trpc.trials.makeDecision.useMutation({
    onSuccess: (result) => {
      const decision = form.getValues("decision");

      if (decision === "convert") {
        toast.success("Trial converted!", {
          description: "Purchase request created for review",
          duration: 5000,
        });
        onSuccess();
        onOpenChange(false);
        if (result.newRequestId) {
          router.push(`/dashboard/requests/${result.newRequestId}`);
        }
      } else if (decision === "extend") {
        toast.success("Trial extended", {
          description: `New end date: ${format(new Date(result.newEndDate!), "MMM d, yyyy")}`,
          duration: 5000,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast.success("Trial cancelled", {
          description: "Trial marked as cancelled",
          duration: 4000,
        });
        onSuccess();
        onOpenChange(false);
      }

      // Invalidate queries
      utils.trials.list.invalidate();
      utils.trials.getById.invalidate({ id: trialId });
    },
    onError: (error) => {
      toast.error("Failed to process decision", {
        description: error.message || "Please try again",
      });
    },
  });

  const onSubmit = (data: DecisionFormValues) => {
    makeDecision.mutate({
      trialId,
      decision: data.decision,
      decisionNotes: data.decisionNotes,
      newEndDate: data.decision === "extend" ? data.newEndDate : undefined,
    });
  };

  const selectedDecision = form.watch("decision");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Make Trial Decision</DialogTitle>
          <DialogDescription>
            Decide what to do with the <strong>{toolName}</strong> trial
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <RadioGroup
            value={selectedDecision}
            onValueChange={(value) => form.setValue("decision", value as DecisionFormValues["decision"])}
            className="space-y-3"
          >
            {/* Convert Option */}
            <div
              className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedDecision === "convert"
                  ? "border-green-500 bg-green-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => form.setValue("decision", "convert")}
            >
              <RadioGroupItem value="convert" id="convert" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="convert" className="cursor-pointer">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Convert to Purchase
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Trial was successful - create a purchase request
                  </p>
                </Label>
              </div>
            </div>

            {/* Extend Option */}
            <div
              className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedDecision === "extend"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => form.setValue("decision", "extend")}
            >
              <RadioGroupItem value="extend" id="extend" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="extend" className="cursor-pointer">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Extend Trial
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Need more time to evaluate
                  </p>
                </Label>
              </div>
            </div>

            {/* Cancel Option */}
            <div
              className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedDecision === "cancel"
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => form.setValue("decision", "cancel")}
            >
              <RadioGroupItem value="cancel" id="cancel" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="cancel" className="cursor-pointer">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Cancel Trial
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Not proceeding with this tool
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Conditional Fields */}
          {selectedDecision === "extend" && (
            <div className="space-y-2">
              <Label htmlFor="newEndDate">New End Date</Label>
              <Input
                type="date"
                id="newEndDate"
                {...form.register("newEndDate")}
                min={format(new Date(), "yyyy-MM-dd")}
              />
              <p className="text-sm text-slate-500">
                Reminders will be rescheduled for the new date
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="decisionNotes">
              {selectedDecision === "cancel" ? "Reason (Required)" : "Notes (Optional)"}
            </Label>
            <Textarea
              id="decisionNotes"
              placeholder={
                selectedDecision === "convert"
                  ? "What made this trial successful?"
                  : selectedDecision === "extend"
                    ? "Why do you need more time?"
                    : "Why are you not proceeding?"
              }
              {...form.register("decisionNotes")}
              className="h-24"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={makeDecision.isPending}
              className="flex-1"
            >
              {makeDecision.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedDecision === "convert" && "Convert to Purchase"}
                  {selectedDecision === "extend" && "Extend Trial"}
                  {selectedDecision === "cancel" && "Cancel Trial"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
