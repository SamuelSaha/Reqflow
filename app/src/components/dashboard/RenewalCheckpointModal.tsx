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
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/api/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RenewalCheckpointModalProps {
  renewalId: string;
  checkpoint: {
    id: string;
    label: string;
    weight: number;
    completed: boolean;
    notes?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RenewalCheckpointModal({
  renewalId,
  checkpoint,
  open,
  onOpenChange,
  onSuccess,
}: RenewalCheckpointModalProps) {
  const [completed, setCompleted] = useState(checkpoint.completed);
  const [notes, setNotes] = useState(checkpoint.notes || "");

  const utils = trpc.useUtils();

  const updateCheckpoint = trpc.renewals.updateCheckpoint.useMutation({
    onMutate: async (variables) => {
      await utils.renewals.list.cancel();
      await utils.renewals.getById.cancel({ id: renewalId });

      const previousList = utils.renewals.list.getData({});
      const previousRenewal = utils.renewals.getById.getData({ id: renewalId });

      if (previousRenewal) {
        utils.renewals.getById.setData({ id: renewalId }, {
          ...previousRenewal,
          readinessCheckpoints: previousRenewal.readinessCheckpoints.map((cp) =>
            cp.id === checkpoint.id
              ? {
                  ...cp,
                  completed: variables.completed,
                  notes: variables.notes ?? cp.notes,
                  completedAt: variables.completed ? new Date().toISOString() : undefined,
                }
              : cp
          ),
        });
      }

      return { previousList, previousRenewal };
    },
    onError: (error, variables, context) => {
      if (context?.previousList) {
        utils.renewals.list.setData({}, context.previousList);
      }
      if (context?.previousRenewal) {
        utils.renewals.getById.setData({ id: renewalId }, context.previousRenewal);
      }
      toast.error("Failed to update checkpoint", {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success("Checkpoint updated", {
        description: `${checkpoint.label} marked as ${completed ? "complete" : "incomplete"}`,
      });
      onSuccess();
      onOpenChange(false);
    },
    onSettled: () => {
      utils.renewals.list.invalidate();
      utils.renewals.getById.invalidate({ id: renewalId });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (completed && !notes.trim()) {
      toast.error("Notes required", {
        description: "Please add notes when completing a checkpoint",
      });
      return;
    }

    updateCheckpoint.mutate({
      renewalId,
      checkpointId: checkpoint.id,
      completed,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Checkpoint</DialogTitle>
          <DialogDescription>
            {checkpoint.label} ({checkpoint.weight} points)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Completed checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={completed}
              onCheckedChange={(checked) => setCompleted(checked as boolean)}
            />
            <Label
              htmlFor="completed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as complete
            </Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes {completed && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this checkpoint..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {completed && (
              <p className="text-xs text-slate-500">
                Required when marking checkpoint as complete
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateCheckpoint.isPending}>
              {updateCheckpoint.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
