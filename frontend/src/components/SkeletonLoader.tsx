export function SkeletonLoader() {
  return (
    <div className="w-full max-w-[500px] mx-auto bg-card rounded-xl border border-border overflow-hidden shadow-lg animate-pulse">
      <div className="w-full h-[260px] bg-border/50" />
      <div className="p-4 bg-card">
        <div className="h-3 w-24 bg-border/50 rounded mb-3" />
        <div className="h-5 w-3/4 bg-border/50 rounded mb-2" />
        <div className="h-4 w-full bg-border/50 rounded mb-1" />
        <div className="h-4 w-2/3 bg-border/50 rounded" />
      </div>
    </div>
  );
}
