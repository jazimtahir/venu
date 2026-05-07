/** Skeleton for My venues page: title row, Add venue button, grid of venue cards. */
export default function VenuesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 bg-section-alt rounded w-24" aria-hidden />
        <div className="h-10 min-h-[44px] w-full sm:w-28 bg-section-alt rounded" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded border border-border bg-section-alt shadow-[var(--shadow-soft)]"
          >
            <div className="flex gap-4 p-4 sm:p-5">
              <div className="h-24 w-28 shrink-0 rounded bg-muted sm:h-28 sm:w-32" aria-hidden />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 bg-section-alt rounded w-3/4" />
                <div className="h-3.5 bg-muted rounded w-20" />
                <div className="h-3 bg-muted rounded w-40" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="h-8 bg-section-alt rounded w-12" />
                  <div className="h-8 bg-section-alt rounded w-12" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
