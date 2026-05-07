import { createClient } from '@/lib/supabase/server';
import { getVenues } from '@/lib/venues';
import { getVenueAvailabilityStatusBatch } from '@/lib/availability';
import { getWishlistVenueIds } from '@/app/actions/wishlist';
import { VenueCard } from '@/components/venue/VenueCard';
import { VenueFiltersLayout } from '@/components/venue/VenueFiltersLayout';
import type { VenueSort } from '@/lib/venues';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<{
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
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const decoded = decodeURIComponent(city);
  return {
    title: `Event Venues in ${decoded}`,
    description: `Find event venues and halls in ${decoded}. Weddings, corporate events and more. Compare prices, capacity and features.`,
  };
}

export default async function CityPage({ params, searchParams }: PageProps) {
  const { city: cityEncoded } = await params;
  const city = decodeURIComponent(cityEncoded);
  const sp = await searchParams;
  const min_price = sp.min_price != null ? Number(sp.min_price) : undefined;
  const max_price = sp.max_price != null ? Number(sp.max_price) : undefined;
  const min_price_per_head = sp.min_price_per_head != null ? Number(sp.min_price_per_head) : undefined;
  const max_price_per_head = sp.max_price_per_head != null ? Number(sp.max_price_per_head) : undefined;
  const capacity = sp.capacity != null ? Number(sp.capacity) : undefined;
  const venue_type = Array.isArray(sp.venue_type) ? sp.venue_type : sp.venue_type ? [sp.venue_type] : undefined;
  const feature = Array.isArray(sp.feature) ? sp.feature : sp.feature ? [sp.feature] : undefined;
  const catering_included = sp.catering_included === 'true' ? true : undefined;
  const sort = (sp.sort as VenueSort) ?? 'featured';
  const page = sp.page != null ? Number(sp.page) : 1;

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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-h1 text-foreground">
          Event Venues in {city}
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
        basePath={`/city/${cityEncoded}`}
      >
        {venues.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} availabilityStatus={availabilityStatuses[venue.id]} wishlistSaved={wishlistSet.has(venue.id)} impressionSource="city" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-8 py-16 text-center shadow-[var(--shadow-sm)]">
            <p className="text-muted-foreground">No venues match your filters in this city.</p>
          </div>
        )}
      </VenueFiltersLayout>
    </div>
  );
}
