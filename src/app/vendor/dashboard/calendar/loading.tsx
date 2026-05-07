/** Skeleton for Calendar page: title, filters/block row, calendar grid (7 cols). */
export default function CalendarLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-section-alt rounded w-24 mb-6" aria-hidden />
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-10 w-full md:w-[160px] bg-section-alt rounded" />
        <div className="h-10 w-full md:w-[140px] bg-section-alt rounded" />
        <div className="h-10 w-full md:w-[160px] bg-section-alt rounded" />
        <div className="h-9 w-full md:w-auto min-h-[44px] md:min-h-0 bg-section-alt rounded md:w-24" />
      </div>
      <div className="rounded border border-border bg-section-alt p-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
          <div className="h-10 w-full md:w-[140px] bg-section-alt rounded" />
          <div className="h-10 w-full md:w-[160px] bg-section-alt rounded" />
          <div className="h-9 min-h-[44px] md:min-h-0 w-full md:w-24 bg-section-alt rounded" />
        </div>
        <div className="h-4 bg-muted rounded w-64" />
      </div>
      <div className="rounded border border-border overflow-hidden bg-card">
        <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground border-b border-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1.5 md:py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[60px] md:min-h-[80px] border-b border-r border-border bg-section-alt/50"
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}
