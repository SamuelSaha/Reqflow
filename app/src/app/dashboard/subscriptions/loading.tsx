import { RequestListSkeleton } from "@/components/dashboard/LoadingSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-44 bg-slate-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
      <RequestListSkeleton rows={5} />
    </div>
  );
}
