export const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="h-5 bg-slate-800 rounded w-3/4 mb-3" />
    <div className="h-3 bg-slate-800 rounded w-full mb-2" />
    <div className="h-3 bg-slate-800 rounded w-2/3 mb-4" />
    <div className="flex gap-2">
      <div className="h-5 bg-slate-800 rounded-full w-16" />
      <div className="h-5 bg-slate-800 rounded-full w-12" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
