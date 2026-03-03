export default function Loading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-20 bg-slate-200 rounded" />
          <div className="h-8 w-56 bg-slate-200 rounded" />
        </div>
        <div className="h-9 w-28 bg-slate-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-lg" />
        ))}
      </div>
      <div className="h-10 w-72 bg-slate-100 rounded" />
      <div className="h-64 bg-slate-100 rounded-lg" />
    </div>
  );
}
