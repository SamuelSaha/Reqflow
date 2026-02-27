"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import { Loader2, FileText, Users, Lock, TrendingUp } from "lucide-react";
import type { RequestTemplateData } from "@/lib/db/schema/request-templates";

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateData: RequestTemplateData, templateId: string) => void;
}

export function TemplatePickerDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplatePickerDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const templates = trpc.templates.list.useQuery(undefined, {
    enabled: open, // Only fetch when dialog is open
  });

  const handleSelectTemplate = (templateData: RequestTemplateData, templateId: string) => {
    onSelectTemplate(templateData, templateId);
    onOpenChange(false);
    setSelectedTemplateId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select a template to pre-fill your request form
          </DialogDescription>
        </DialogHeader>

        {templates.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : templates.isError ? (
          <div className="text-center py-8 text-red-600">
            Failed to load templates
          </div>
        ) : templates.data && templates.data.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No templates available yet</p>
            <p className="text-sm text-slate-500 mt-2">
              Save your first request as a template to reuse it later
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {templates.data?.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:border-blue-300 hover:shadow-md ${
                  selectedTemplateId === template.id ? "border-blue-600 shadow-md" : ""
                }`}
                onClick={() => setSelectedTemplateId(template.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        {template.name}
                        {template.isPublic ? (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Org-wide
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Personal
                          </Badge>
                        )}
                        {template.useCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {template.useCount} uses
                          </Badge>
                        )}
                      </CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    {template.templateData.category && (
                      <Badge variant="secondary" className="capitalize">
                        {template.templateData.category}
                      </Badge>
                    )}
                    {template.templateData.vendorName && (
                      <span className="text-slate-600">
                        Vendor: <strong>{template.templateData.vendorName}</strong>
                      </span>
                    )}
                    {template.templateData.amount && (
                      <span className="text-slate-600">
                        Amount: <strong>€{template.templateData.amount}</strong>
                      </span>
                    )}
                    {template.templateData.frequency && (
                      <Badge variant="outline" className="capitalize">
                        {template.templateData.frequency}
                      </Badge>
                    )}
                  </div>
                  {selectedTemplateId === template.id && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTemplate(template.templateData, template.id);
                        }}
                        className="flex-1"
                      >
                        Use This Template
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplateId(null);
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
