export function SkeletonLoader() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-lg border border-border bg-panel animate-pulse">
        <div className="h-52 w-full bg-border/70" />
        <div className="space-y-3 p-4">
          <div className="h-3 w-24 rounded bg-border" />
          <div className="h-5 w-3/4 rounded bg-border" />
          <div className="h-4 w-full rounded bg-border" />
          <div className="h-4 w-2/3 rounded bg-border" />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-background p-4 animate-pulse">
        <div className="mb-4 h-5 w-36 rounded bg-border" />
        <div className="space-y-3">
          <div className="h-12 rounded bg-border" />
          <div className="h-12 rounded bg-border" />
          <div className="h-12 rounded bg-border" />
        </div>
      </div>
    </div>
  );
}
