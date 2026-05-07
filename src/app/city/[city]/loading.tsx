import { VenueCardSkeleton } from '@/components/venue/VenueCardSkeleton';

export default function CityLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="h-9 bg-section-alt rounded w-56 animate-pulse" />
        <div className="mt-2 h-5 bg-muted rounded w-32 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <VenueCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
