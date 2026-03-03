export default function Loading() {
  return (
    <div className="max-w-3xl space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 bg-slate-200 rounded" />
        <div className="space-y-1">
          <div className="h-7 w-40 bg-slate-200 rounded" />
          <div className="h-4 w-56 bg-slate-100 rounded" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-slate-100 rounded-lg" />
      ))}
    </div>
  );
}
