"use client";

import { WorkflowBuilder } from "@/components/settings/WorkflowBuilder";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NewWorkflowPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings/workflows">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Create Approval Workflow
          </h2>
          <p className="text-slate-600 mt-1">
            Define conditions and approval routing rules
          </p>
        </div>
      </div>

      <WorkflowBuilder />
    </div>
  );
}
