"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/api/react";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation"; // TODO: Enable when subscriptions pages are created

interface ConvertToSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  requestTitle: string;
  requestAmount: string;
  frequency: string;
}

export function ConvertToSubscriptionDialog({
  open,
  onOpenChange,
  requestId,
  requestTitle,
  requestAmount,
  frequency,
}: ConvertToSubscriptionDialogProps) {
  // const router = useRouter(); // TODO: Enable when subscriptions pages are created
  const utils = trpc.useUtils();

  const convertMutation = trpc.subscriptions.createFromRequest.useMutation({
    onMutate: () => {
      toast.loading("Converting to subscription...", { id: "convert" });
    },
    onSuccess: () => {
      toast.success("Subscription created", {
        id: "convert",
        description: "The request has been successfully converted to a subscription. The subscription link will appear below.",
      });
      // Invalidate request data to refresh the UI
      utils.requests.getById.invalidate({ id: requestId });
      onOpenChange(false);
      // TODO: Navigate to subscription detail page when it's created
      // router.push(`/dashboard/subscriptions/${subscription.id}`);
    },
    onError: (error) => {
      toast.error("Conversion failed", {
        id: "convert",
        description: error.message,
      });
    },
  });

  const handleConvert = () => {
    convertMutation.mutate({ requestId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Convert to Subscription
          </DialogTitle>
          <DialogDescription>
            This will create a new subscription tracking entry based on this approved request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview card */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div>
              <p className="text-caption text-slate-500">Tool Name</p>
              <p className="text-body-sm font-medium text-slate-900">{requestTitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-caption text-slate-500">Total Cost</p>
                <p className="text-body-sm font-medium text-slate-900">
                  €{parseFloat(requestAmount).toLocaleString("en", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-caption text-slate-500">Billing Cycle</p>
                <p className="text-body-sm font-medium text-slate-900 capitalize">
                  {frequency === "monthly" ? "Monthly" : "Annually"}
                </p>
              </div>
            </div>
          </div>

          {/* Info message */}
          <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 p-3">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-caption text-blue-900 font-medium">What happens next?</p>
              <p className="text-caption text-blue-700 mt-1">
                A new subscription will be created with data pre-filled from this request.
                You can edit details like seats, add-ons, and end dates after creation.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={convertMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            disabled={convertMutation.isPending}
          >
            {convertMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Convert to Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
