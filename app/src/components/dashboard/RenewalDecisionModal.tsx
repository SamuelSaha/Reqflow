"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/api/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RenewalDecisionModalProps {
  renewalId: string;
  vendorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RenewalDecisionModal({
  renewalId,
  vendorName,
  open,
  onOpenChange,
  onSuccess,
}: RenewalDecisionModalProps) {
  const [decision, setDecision] = useState<"keep" | "downgrade" | "cancel" | "replace" | "renegotiate">("keep");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();

  const makeDecision = trpc.renewals.makeDecision.useMutation({
    onSuccess: (data) => {
      toast.success("Decision recorded", {
        description: `Renewal ${decision} - ${vendorName}`,
      });
      utils.renewals.list.invalidate();
      utils.renewals.getById.invalidate({ id: renewalId });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to record decision", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim() || notes.trim().length < 10) {
      toast.error("Notes required", {
        description: "Please add detailed notes about your decision (minimum 10 characters)",
      });
      return;
    }

    makeDecision.mutate({
      renewalId,
      decision,
      decisionNotes: notes.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Make Renewal Decision</DialogTitle>
          <DialogDescription>
            Record your decision for {vendorName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Decision options */}
          <div className="space-y-3">
            <Label>What would you like to do?</Label>
            <RadioGroup value={decision} onValueChange={(value: any) => setDecision(value)}>
              <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="keep" id="keep" className="mt-1" />
                <Label htmlFor="keep" className="flex-1 cursor-pointer">
                  <p className="font-medium">Keep (Renew as-is)</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Continue with current contract and pricing
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="downgrade" id="downgrade" className="mt-1" />
                <Label htmlFor="downgrade" className="flex-1 cursor-pointer">
                  <p className="font-medium">Downgrade</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Reduce seats, features, or plan tier
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="cancel" id="cancel" className="mt-1" />
                <Label htmlFor="cancel" className="flex-1 cursor-pointer">
                  <p className="font-medium">Cancel</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Do not renew, cancel before deadline
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="replace" id="replace" className="mt-1" />
                <Label htmlFor="replace" className="flex-1 cursor-pointer">
                  <p className="font-medium">Replace</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Switch to alternative vendor/tool
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="renegotiate" id="renegotiate" className="mt-1" />
                <Label htmlFor="renegotiate" className="flex-1 cursor-pointer">
                  <p className="font-medium">Renegotiate</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Negotiate better pricing or terms
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Decision notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Decision Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Explain your decision, include any context, next steps, or action items..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="resize-none"
              required
            />
            <p className="text-xs text-slate-500">
              Minimum 10 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={makeDecision.isPending}>
              {makeDecision.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Record Decision
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
