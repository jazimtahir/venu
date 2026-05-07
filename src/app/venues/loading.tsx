import { VenueCardSkeleton } from '@/components/venue/VenueCardSkeleton';

export default function VenuesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-6 sm:px-4 sm:py-12 lg:px-6">
      <div className="mb-8 sm:mb-10">
        <div className="h-9 bg-section-alt rounded w-48 animate-pulse" />
        <div className="mt-2 h-5 bg-muted rounded w-32 animate-pulse" />
      </div>
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="hidden lg:block lg:w-72 shrink-0">
          <div className="h-96 rounded border border-border bg-card shadow-[var(--shadow-soft)] animate-pulse" />
        </aside>
        <div className="lg:hidden w-full">
          <div className="w-full min-h-[44px] rounded border border-border bg-section-alt animate-pulse" aria-hidden />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-section-alt/50 p-1 w-fit h-10 bg-section-alt animate-pulse" aria-hidden />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3 2xl:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <VenueCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
