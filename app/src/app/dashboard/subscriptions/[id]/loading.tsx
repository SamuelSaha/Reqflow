export default function Loading() {
  return (
    <div className="max-w-3xl space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 bg-slate-200 rounded" />
        <div className="space-y-1">
          <div className="h-7 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-lg" />
        ))}
      </div>
      <div className="h-48 bg-slate-100 rounded-lg" />
    </div>
  );
}
