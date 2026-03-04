import { Button } from "@/components/ui/button";
import { Plus, CheckSquare, Sparkles } from "lucide-react";
import Link from "next/link";

export function EmptyRecentRequests() {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="relative mb-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
          <Plus className="w-8 h-8 text-slate-400" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">
        No Requests Yet
      </h3>
      <p className="text-sm text-slate-600 mb-4 max-w-xs">
        Start tracking company spend by creating your first purchase request
      </p>
      <Link href="/dashboard/requests/new">
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Request
        </Button>
      </Link>
    </div>
  );
}

export function EmptyPendingApprovals() {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 mb-4">
        <CheckSquare className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">
        All Caught Up!
      </h3>
      <p className="text-sm text-slate-600 max-w-xs">
        No pending approvals requiring your review
      </p>
      <div className="flex items-center gap-1.5 text-xs text-green-600 mt-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="font-medium">You're doing great</span>
      </div>
    </div>
  );
}
