export function VenueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded border border-border bg-card shadow-[var(--shadow-card)] animate-pulse">
      <div className="aspect-[3/2] sm:aspect-[4/3] bg-section-alt" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 bg-muted rounded w-24" />
        </div>
        <div className="h-5 bg-section-alt rounded w-3/4" />
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <div className="h-3.5 bg-muted rounded w-28" />
          <div className="h-3.5 bg-muted rounded w-24" />
        </div>
        <div className="mt-5 h-px bg-border" aria-hidden />
        <div className="mt-5 flex items-end justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="h-3 bg-muted rounded w-8" />
            <div className="h-5 bg-section-alt rounded w-20" />
          </div>
          <div className="h-4 bg-muted rounded w-12" />
        </div>
        <div className="mt-5 min-h-[44px] rounded border border-border bg-section-alt/50" aria-hidden />
      </div>
    </div>
  );
}
