import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getVenues } from '@/lib/venues';
import { getVenueAvailabilityStatusBatch } from '@/lib/availability';
import { getWishlistVenueIds } from '@/app/actions/wishlist';
import { VenueFiltersLayout } from '@/components/venue/VenueFiltersLayout';
import { VenueListViewSwitch } from '@/components/venue/VenueListViewSwitch';
import { VenueCardSkeleton } from '@/components/venue/VenueCardSkeleton';
import type { VenueSort } from '@/lib/venues';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Event Venues in Pakistan',
  description: 'Browse and compare event venues across Pakistan. Weddings, corporate events and more. Filter by city, budget, capacity and more.',
};

interface SearchParams {
  city?: string;
  min_price?: string;
  max_price?: string;
  min_price_per_head?: string;
  max_price_per_head?: string;
  capacity?: string;
  venue_type?: string | string[];
  feature?: string | string[];
  catering_included?: string;
  sort?: string;
  page?: string;
  view?: string;
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const city = typeof params.city === 'string' ? params.city : undefined;
  const min_price = params.min_price != null ? Number(params.min_price) : undefined;
  const max_price = params.max_price != null ? Number(params.max_price) : undefined;
  const min_price_per_head = params.min_price_per_head != null ? Number(params.min_price_per_head) : undefined;
  const max_price_per_head = params.max_price_per_head != null ? Number(params.max_price_per_head) : undefined;
  const capacity = params.capacity != null ? Number(params.capacity) : undefined;
  const venue_type = Array.isArray(params.venue_type)
    ? params.venue_type
    : params.venue_type
      ? [params.venue_type]
      : undefined;
  const feature = Array.isArray(params.feature)
    ? params.feature
    : params.feature
      ? [params.feature]
      : undefined;
  const catering_included = params.catering_included === 'true' ? true : undefined;
  const sort = (params.sort as VenueSort) ?? 'featured';
  const page = params.page != null ? Number(params.page) : 1;

  const supabase = await createClient();
  const { venues, total } = await getVenues(supabase, {
    city,
    min_price: Number.isNaN(min_price) ? undefined : min_price,
    max_price: Number.isNaN(max_price) ? undefined : max_price,
    min_price_per_head: Number.isNaN(min_price_per_head) ? undefined : min_price_per_head,
    max_price_per_head: Number.isNaN(max_price_per_head) ? undefined : max_price_per_head,
    capacity: Number.isNaN(capacity) ? undefined : capacity,
    venue_type,
    features: feature,
    catering_included,
    sort,
    page,
    perPage: 12,
  });
  const [availabilityStatuses, wishlistVenueIds] = await Promise.all([
    getVenueAvailabilityStatusBatch(venues.map((v) => v.id)),
    getWishlistVenueIds(),
  ]);
  const wishlistSet = new Set(wishlistVenueIds);

  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-6 sm:px-4 sm:py-12 lg:px-6">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-h1 text-foreground">
          Event Venues
        </h1>
        <p className="mt-2 text-muted-foreground">
          {total} venue{total !== 1 ? 's' : ''} found
        </p>
      </div>

      <VenueFiltersLayout
        initialCity={city}
        initialMinPrice={min_price}
        initialMaxPrice={max_price}
        initialMinPricePerHead={min_price_per_head}
        initialMaxPricePerHead={max_price_per_head}
        initialCapacity={capacity}
        initialVenueType={venue_type ?? []}
        initialFeatures={feature ?? []}
        initialCateringIncluded={catering_included}
        initialSort={sort}
      >
        {venues.length > 0 ? (
          <Suspense
            fallback={
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-border bg-section-alt/50 p-1 w-fit h-10 bg-section-alt animate-pulse" aria-hidden />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3 2xl:gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <VenueCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            }
          >
            <VenueListViewSwitch
              venues={venues}
              availabilityStatuses={availabilityStatuses}
              wishlistSet={wishlistSet}
            />
          </Suspense>
        ) : (
          <div className="rounded-2xl border border-border bg-section-alt px-8 py-16 text-center shadow-[var(--shadow-sm)]">
            <p className="text-muted-foreground mb-4">No venues match your filters. Try loosening your search.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/venues"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                See all venues
              </Link>
              <Link
                href="/city/Lahore"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Browse Lahore
              </Link>
              <Link
                href="/city/Karachi"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Browse Karachi
              </Link>
            </div>
          </div>
        )}
      </VenueFiltersLayout>
    </div>
  );
}
