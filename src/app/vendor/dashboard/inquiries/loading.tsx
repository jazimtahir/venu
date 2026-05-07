/** Skeleton for Inquiries page: title, filters row, list rows. */
export default function InquiriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-section-alt rounded w-28 mb-6" aria-hidden />
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <div className="h-4 bg-muted rounded w-14" />
        <div className="h-10 bg-section-alt rounded w-[140px]" />
        <div className="h-10 bg-section-alt rounded w-[140px]" />
        <div className="h-10 bg-section-alt rounded w-[180px]" />
      </div>
      <div className="md:hidden w-full">
        <div className="w-full min-h-[44px] rounded border border-border bg-section-alt" aria-hidden />
      </div>
      <ul className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <li
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-3 rounded border border-border bg-section-alt p-4"
          >
            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-28" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
            <div className="h-4 bg-muted rounded w-16" />
            <div className="flex gap-2 border-t border-border pt-2 sm:border-t-0 sm:pt-0 sm:pl-3 sm:border-l">
              <div className="h-9 bg-section-alt rounded w-20" />
              <div className="h-9 bg-section-alt rounded w-14" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
