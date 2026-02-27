"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/api/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RequestTemplateData } from "@/lib/db/schema/request-templates";

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateData: RequestTemplateData;
  suggestedName?: string;
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  templateData,
  suggestedName,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState(suggestedName || "");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const utils = trpc.useUtils();
  const createTemplate = trpc.templates.create.useMutation({
    onSuccess: () => {
      toast.success("Template saved!", {
        description: isPublic
          ? "Available to everyone in your organization"
          : "Available only to you",
      });
      utils.templates.list.invalidate();
      onOpenChange(false);
      // Reset form
      setName("");
      setDescription("");
      setIsPublic(false);
    },
    onError: (error) => {
      toast.error("Failed to save template", {
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }

    createTemplate.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic,
      templateData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save this request configuration for future use
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="e.g., Office Supplies - Standard Order"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createTemplate.isPending}
            />
            <p className="text-xs text-slate-500">
              Give it a clear name so you can find it easily later
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              placeholder="When should this template be used?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createTemplate.isPending}
              rows={3}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="is-public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
              disabled={createTemplate.isPending}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="is-public"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Share with organization
              </Label>
              <p className="text-sm text-slate-500">
                Make this template available to everyone in your organization
              </p>
            </div>
          </div>

          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-medium mb-1">This template will include:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {templateData.category && <li>Category: {templateData.category}</li>}
              {templateData.vendorName && <li>Vendor: {templateData.vendorName}</li>}
              {templateData.amount && <li>Amount: €{templateData.amount}</li>}
              {templateData.frequency && <li>Frequency: {templateData.frequency}</li>}
              {templateData.urgency && <li>Urgency: {templateData.urgency}</li>}
              {templateData.title && <li>Title template</li>}
              {templateData.description && <li>Description template</li>}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createTemplate.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createTemplate.isPending || !name.trim()}>
            {createTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
