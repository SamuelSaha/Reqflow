import { RequestListSkeleton } from "@/components/dashboard/LoadingSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 bg-slate-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-slate-100 rounded animate-pulse" />
          <div className="h-9 w-24 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
      <RequestListSkeleton rows={4} />
    </div>
  );
}
