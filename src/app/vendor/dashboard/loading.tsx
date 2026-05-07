/** Skeleton shown while vendor dashboard segment loads. */
export default function VendorDashboardLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded border border-border bg-section-alt p-5">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="mt-2 h-8 bg-section-alt rounded w-16" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="h-10 min-h-[44px] w-full sm:w-32 bg-section-alt rounded" />
        <div className="h-10 min-h-[44px] w-full sm:w-28 bg-section-alt rounded" />
        <div className="h-10 min-h-[44px] w-full sm:w-36 bg-section-alt rounded" />
      </div>
      <section>
        <div className="h-6 bg-section-alt rounded w-40 mb-4" aria-hidden />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded border border-border bg-section-alt" />
          ))}
        </div>
      </section>
      <section>
        <div className="h-6 bg-section-alt rounded w-36 mb-4" aria-hidden />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded border border-border bg-section-alt" />
          ))}
        </div>
      </section>
      <section>
        <div className="h-6 bg-section-alt rounded w-28 mb-4" aria-hidden />
        <div className="rounded border border-border bg-section-alt p-4 sm:p-5">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="mt-3 h-9 bg-section-alt rounded w-28" />
        </div>
      </section>
    </div>
  );
}
