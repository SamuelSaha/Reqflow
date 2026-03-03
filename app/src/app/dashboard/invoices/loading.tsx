import { RequestListSkeleton } from "@/components/dashboard/LoadingSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-52 bg-slate-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
      <RequestListSkeleton rows={4} />
    </div>
  );
}
