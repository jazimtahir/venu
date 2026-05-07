import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, BadgeCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getVenueBySlug, getSimilarVenues } from '@/lib/venues';
import { VenueCard } from '@/components/venue/VenueCard';
import { AddToCompareButton } from '@/components/venue/AddToCompareButton';

const InquiryForm = dynamic(
  () => import('@/components/venue/InquiryForm').then((m) => ({ default: m.InquiryForm })),
  {
    loading: () => (
      <div className="rounded-2xl border border-border bg-section-alt p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-32 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-24 bg-muted rounded w-full" />
        </div>
      </div>
    ),
  }
);
import { WishlistToggle } from '@/components/venue/WishlistToggle';
import { VenueAvailabilityChecker } from '@/components/venue/VenueAvailabilityChecker';
import { RecordVenueView } from '@/components/venue/RecordVenueView';
import { getWishlistVenueIds } from '@/app/actions/wishlist';
import { getVenueAvailability } from '@/lib/availability';
import { formatTime12h } from '@/lib/utils';
import { SITE_NAME } from '@/utils/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatPrice(n: number | null) {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M PKR`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K PKR`;
  return `${n} PKR`;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: venue } = await getVenueBySlug(supabase, slug);
  if (!venue) return { title: 'Venue not found' };
  const min = venue.min_price != null ? venue.min_price / 1_000_000 : null;
  const title = min != null
    ? `${venue.name} – Event Hall in ${venue.city} Under ${min} Million | ${SITE_NAME}`
    : `${venue.name} – Event Venue in ${venue.city} | ${SITE_NAME}`;
  return {
    title,
    description: venue.description?.slice(0, 160) ?? `Event venue ${venue.name} in ${venue.city}. ${venue.capacity ? `Capacity up to ${venue.capacity} guests.` : ''}`,
    openGraph: {
      title,
      description: venue.description?.slice(0, 160) ?? undefined,
    },
  };
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: venue, error } = await getVenueBySlug(supabase, slug);
  if (error || !venue) notFound();

  const [similar, wishlistVenueIds] = await Promise.all([
    getSimilarVenues(supabase, venue.id, venue.city, 4),
    getWishlistVenueIds(),
  ]);
  const wishlistSaved = wishlistVenueIds.includes(venue.id);
  const wishlistSet = new Set(wishlistVenueIds);
  const now = new Date();
  const { dates: monthDates } = await getVenueAvailability(venue.id, now.getFullYear(), now.getMonth() + 1);
  const datesWithAvailability = monthDates.filter((d) => d.slots.some((s) => s.available)).length;
  const totalDatesInMonth = monthDates.length;
  const images = (venue.venue_images ?? []).sort(
    (a: { display_order?: number }, b: { display_order?: number }) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  const venueWithPrice = venue as {
    per_head_with_catering_min?: number | null;
    per_head_with_catering_max?: number | null;
    per_head_without_catering_min?: number | null;
    per_head_without_catering_max?: number | null;
  };
  const perHeadWith = venueWithPrice.per_head_with_catering_min != null || venueWithPrice.per_head_with_catering_max != null
    ? [formatPrice(venueWithPrice.per_head_with_catering_min ?? null), formatPrice(venueWithPrice.per_head_with_catering_max ?? null)].filter(Boolean).join(' – ')
    : null;
  const perHeadWithout = venueWithPrice.per_head_without_catering_min != null || venueWithPrice.per_head_without_catering_max != null
    ? [formatPrice(venueWithPrice.per_head_without_catering_min ?? null), formatPrice(venueWithPrice.per_head_without_catering_max ?? null)].filter(Boolean).join(' – ')
    : null;
  const priceRange = perHeadWith ?? perHeadWithout;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EventVenue',
    name: venue.name,
    description: venue.description ?? undefined,
    address: venue.address
      ? { '@type': 'PostalAddress', streetAddress: venue.address }
      : undefined,
    image: images[0]?.image_url,
    maximumAttendeeCapacity: venue.capacity ?? undefined,
    priceRange: priceRange ? `${priceRange} per head` : undefined,
  };

  const viewCount = (venue as { view_count?: number }).view_count ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <RecordVenueView venueId={venue.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link href="/venues" className="inline-flex items-center gap-1 min-h-[44px] py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          ← Back to venues
        </Link>
        <WishlistToggle venueId={venue.id} initialSaved={wishlistSaved} variant="detail" />
        <AddToCompareButton venueId={venue.id} variant="detail" />
      </div>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1 text-foreground">{venue.name}</h1>
          {(venue as { is_verified?: boolean }).is_verified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-700" title="Verified listing">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              Verified
            </span>
          )}
        </div>
        <p className="mt-2 text-muted-foreground">
          {venue.city}
          {venue.area ? ` · ${venue.area}` : ''}
        </p>
        {(venue as { rating?: { average: number; count: number } }).rating != null && (
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
              <span className="font-medium text-foreground">{(venue as { rating: { average: number; count: number } }).rating.average}</span>
              <span>
                ({(venue as { rating: { count: number } }).rating.count} review{(venue as { rating: { count: number } }).rating.count !== 1 ? 's' : ''})
              </span>
            </span>
            {viewCount > 0 && (
              <span>{viewCount.toLocaleString()} view{viewCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        )}
        {viewCount > 0 && (venue as { rating?: { average: number; count: number } }).rating == null && (
          <p className="mt-2 text-muted-foreground">{viewCount.toLocaleString()} view{viewCount !== 1 ? 's' : ''}</p>
        )}
      </header>

      {/* Gallery */}
      <section className="mb-12" id="gallery">
        {images.length > 0 && (
          <p className="text-sm text-muted-foreground mb-3">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.length > 0 ? (
            images.map((img: { id: string; image_url: string }, i: number) => (
              <div
                key={img.id}
                className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted border border-border ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <Image
                  src={img.image_url}
                  alt={`${venue.name} – ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full aspect-[21/9] rounded-2xl bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground border border-border">
              <MapPin className="h-12 w-12" strokeWidth={1.5} />
              <span className="text-sm">Photos coming soon</span>
            </div>
          )}
        </div>
      </section>

      {(venue as { venue_videos?: { id: string; video_url: string; display_order: number }[] }).venue_videos?.length ? (
        <section className="mb-12" id="videos">
          <h2 className="text-h3 text-foreground mb-4">Videos</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {((venue as { venue_videos: { id: string; video_url: string; display_order: number }[] }).venue_videos)
              .sort((a, b) => a.display_order - b.display_order)
              .map((v) => {
                const url = v.video_url;
                const isYoutube = /youtube\.com|youtu\.be/i.test(url);
                const isVimeo = /vimeo\.com/i.test(url);
                let embedSrc: string | null = null;
                if (isYoutube) {
                  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
                  embedSrc = match ? `https://www.youtube.com/embed/${match[1]}` : null;
                } else if (isVimeo) {
                  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
                  embedSrc = match ? `https://player.vimeo.com/video/${match[1]}` : null;
                }
                return (
                  <div key={v.id} className="aspect-video w-full overflow-hidden rounded-2xl bg-muted border border-border">
                    {embedSrc ? (
                      <iframe
                        src={embedSrc}
                        title="Venue video"
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={url} controls className="h-full w-full object-contain" />
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          {(priceRange || (venue as { catering_included?: boolean }).catering_included) && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]" id="pricing">
              <h2 className="text-h3 text-foreground mb-2">Pricing</h2>
              {(venue as { catering_included?: boolean }).catering_included && (
                <p className="text-foreground">Catering included</p>
              )}
              {perHeadWith && (
                <p className={perHeadWithout ? 'mt-2 text-foreground' : 'text-foreground'}>
                  Per head (with catering): {perHeadWith} PKR
                </p>
              )}
              {perHeadWithout && (
                <p className="mt-2 text-foreground">
                  Per head (without catering): {perHeadWithout} PKR
                </p>
              )}
            </section>
          )}
          {(venue as { venue_catering_packages?: { id: string; name: string; per_head_price: number; description: string | null; menu_text: string | null; display_order: number }[] }).venue_catering_packages?.length ? (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]" id="catering-packages">
              <h2 className="text-h3 text-foreground mb-3">Catering packages</h2>
              <div className="space-y-4">
                {((venue as { venue_catering_packages: { id: string; name: string; per_head_price: number; description: string | null; menu_text: string | null; display_order: number }[] }).venue_catering_packages)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((pkg) => (
                    <div key={pkg.id} className="rounded-xl border border-border bg-muted/30 p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium text-foreground">{pkg.name}</span>
                        <span className="text-foreground">Rs {pkg.per_head_price.toLocaleString()} per head</span>
                      </div>
                      {pkg.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>
                      )}
                      {pkg.menu_text && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium text-foreground hover:underline">View menu / dishes</summary>
                          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{pkg.menu_text}</p>
                        </details>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          ) : null}
          {(venue as { venue_floors?: { id: string; name: string; capacity: number | null; display_order: number }[] }).venue_floors?.length ? (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-h3 text-foreground mb-3">Floors / halls</h2>
              <ul className="space-y-2">
                {((venue as { venue_floors: { id: string; name: string; capacity: number | null; display_order: number }[] }).venue_floors)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((floor) => (
                    <li key={floor.id} className="flex flex-wrap items-baseline gap-2 text-foreground">
                      <span className="font-medium">{floor.name}</span>
                      {floor.capacity != null && (
                        <span className="text-muted-foreground text-sm">– up to {floor.capacity} guests</span>
                      )}
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}
          {venue.capacity != null && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-h3 text-foreground mb-2">Capacity</h2>
              <p className="text-foreground">Total capacity: up to {venue.capacity} guests</p>
            </section>
          )}
          {(venue as { venue_slots?: { id: string; name: string; start_time: string; end_time: string; display_order: number }[] }).venue_slots?.length ? (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-h3 text-foreground mb-3">Booking slots</h2>
              <ul className="space-y-1.5">
                {((venue as { venue_slots: { id: string; name: string; start_time: string; end_time: string; display_order: number }[] }).venue_slots)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((slot) => {
                    const timeStr =
                      slot.start_time && slot.end_time
                        ? ` (${formatTime12h(slot.start_time)} – ${formatTime12h(slot.end_time)})`
                        : '';
                    return (
                      <li key={slot.id} className="text-foreground">
                        {slot.name}{timeStr}
                      </li>
                    );
                  })}
              </ul>
            </section>
          ) : null}
          {venue.venue_features?.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-h3 text-foreground mb-3">Features</h2>
              <ul className="flex flex-wrap gap-2">
                {venue.venue_features.map((f: { id: string; feature_name: string }) => (
                  <li key={f.id} className="rounded-full bg-muted px-4 py-1.5 text-sm text-foreground">
                    {f.feature_name}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {venue.description && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]" id="about">
              <h2 className="text-h3 text-foreground mb-3">About</h2>
              <p className="text-foreground whitespace-pre-line leading-relaxed">{venue.description}</p>
            </section>
          )}
          {venue.google_maps_link && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] overflow-hidden" id="location">
              <h2 className="text-h3 text-foreground mb-3">Location</h2>
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
                <iframe
                  src={
                    venue.google_maps_link.includes('embed')
                      ? venue.google_maps_link
                      : venue.google_maps_link.replace('www.google.com/maps/place/', 'www.google.com/maps/embed/place/')
                  }
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Venue location"
                  className="min-h-[300px]"
                />
              </div>
              {venue.address && <p className="mt-2 text-sm text-muted-foreground">{venue.address}</p>}
            </section>
          )}
        </div>
        <div>
          <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card-hover)]" id="inquiry">
            {totalDatesInMonth > 0 && (
              <p className="text-sm text-muted-foreground mb-3">
                {datesWithAvailability === 0
                  ? 'Fully booked this month.'
                  : `${datesWithAvailability} date${datesWithAvailability !== 1 ? 's' : ''} with availability this month.`}
              </p>
            )}
            <VenueAvailabilityChecker
              venueId={venue.id}
              offeredSlots={((venue as { venue_slots?: { id: string; name: string; start_time: string; end_time: string; display_order: number }[] }).venue_slots ?? []).map((s) => ({ ...s, venue_id: venue.id }))}
            />
            <InquiryForm
              venueId={venue.id}
              venueName={venue.name}
              offeredSlots={((venue as { venue_slots?: { id: string; name: string; start_time: string; end_time: string; display_order: number }[] }).venue_slots ?? []).map((s) => ({ ...s, venue_id: venue.id }))}
              cateringPackages={(venue as { venue_catering_packages?: { id: string; name: string; per_head_price: number }[] }).venue_catering_packages ?? []}
              floors={(venue as { venue_floors?: { id: string; name: string; capacity: number | null }[] }).venue_floors ?? []}
            />
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-20 pt-16 border-t border-border">
          <h2 className="text-h2 text-foreground mb-8">Similar venues</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((v) => (
              <VenueCard key={v.id} venue={v} wishlistSaved={wishlistSet.has(v.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
