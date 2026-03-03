import { RequestListSkeleton } from "@/components/dashboard/LoadingSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      <RequestListSkeleton rows={6} />
    </div>
  );
}
