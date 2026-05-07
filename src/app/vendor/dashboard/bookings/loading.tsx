/** Skeleton for Bookings page: title row, Add booking button, filters, list rows. */
export default function BookingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 bg-section-alt rounded w-24" aria-hidden />
        <div className="h-10 min-h-[44px] w-full sm:w-32 bg-section-alt rounded" />
      </div>
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <div className="h-4 bg-muted rounded w-14" />
        <div className="h-10 bg-section-alt rounded w-[130px]" />
        <div className="h-10 bg-section-alt rounded w-[180px]" />
        <div className="h-10 bg-section-alt rounded w-[140px]" />
        <div className="h-10 bg-section-alt rounded w-[140px]" />
      </div>
      <div className="md:hidden w-full">
        <div className="w-full min-h-[44px] rounded border border-border bg-section-alt" aria-hidden />
      </div>
      <ul className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="flex flex-col gap-2 rounded border border-border bg-section-alt p-4 md:flex-row md:flex-wrap md:items-center md:gap-3">
            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
              <div className="h-4 bg-muted rounded w-28" />
              <div className="h-4 bg-muted rounded w-24" />
            </div>
            <div className="h-4 bg-muted rounded w-20" />
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-5 bg-muted rounded w-16" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
