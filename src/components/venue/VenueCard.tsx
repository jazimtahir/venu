import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Star, BadgeCheck } from 'lucide-react';
import type { Venue } from '@/types/database';
import type { AvailabilityStatus } from '@/lib/availability';
import { WishlistToggle } from './WishlistToggle';
import { RecordVenueImpression } from './RecordVenueImpression';
import type { ImpressionSource } from '@/app/actions/venue-impressions';

interface VenueCardProps {
  venue: Venue & {
    venue_images?: { image_url: string }[];
    rating?: { average: number; count: number };
  };
  availabilityStatus?: AvailabilityStatus | null;
  /** Set to true if this venue is in the current user's wishlist */
  wishlistSaved?: boolean;
  /** When set, record an impression for this listing source (once on mount) */
  impressionSource?: ImpressionSource;
}

function formatPrice(n: number | null) {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function AvailabilityDot({ status }: { status: AvailabilityStatus }) {
  if (status === 'available')
    return <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title="Available" aria-hidden />;
  if (status === 'limited')
    return <span className="inline-block h-2 w-2 rounded-full bg-amber-500" title="Limited dates" aria-hidden />;
  return <span className="inline-block h-2 w-2 rounded-full bg-muted" title="Fully booked" aria-hidden />;
}

export function VenueCard({ venue, availabilityStatus, wishlistSaved = false, impressionSource }: VenueCardProps) {
  const imageUrl = venue.venue_images?.[0]?.image_url ?? null;
  if (impressionSource) {
    // Record impression once when card is shown (client-side)
    return (
      <>
        <RecordVenueImpression venueId={venue.id} source={impressionSource} />
        <VenueCardInner venue={venue} availabilityStatus={availabilityStatus} wishlistSaved={wishlistSaved} imageUrl={imageUrl} />
      </>
    );
  }
  return <VenueCardInner venue={venue} availabilityStatus={availabilityStatus} wishlistSaved={wishlistSaved} imageUrl={imageUrl} />;
}

function VenueCardInner({
  venue,
  availabilityStatus,
  wishlistSaved,
  imageUrl,
}: {
  venue: VenueCardProps['venue'];
  availabilityStatus: AvailabilityStatus | null | undefined;
  wishlistSaved: boolean;
  imageUrl: string | null;
}) {
  const perHeadMin =
    venue.per_head_with_catering_min ?? venue.per_head_without_catering_min ?? venue.min_per_head_price ?? null;
  const startingPrice = perHeadMin != null ? formatPrice(perHeadMin) : null;

  return (
    <Link
      href={`/venue/${venue.slug}`}
      className="group block overflow-hidden rounded border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:border-brand/20 hover:-translate-y-1.5"
    >
      <div className="aspect-[3/2] sm:aspect-[4/3] relative overflow-hidden bg-section-alt">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={venue.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-section-alt">
            <MapPin className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">Photo coming soon</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 from-20% via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {venue.is_featured && (
            <span className="rounded bg-card px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-brand shadow-[var(--shadow-soft)]">
              Featured
            </span>
          )}
          {venue.is_verified && (
            <span className="inline-flex items-center gap-1 rounded bg-card px-3 py-1.5 text-[10px] font-medium text-emerald-600 shadow-[var(--shadow-soft)]" title="Verified listing">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Verified
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4 z-10">
          <WishlistToggle venueId={venue.id} initialSaved={wishlistSaved} variant="card" />
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          {availabilityStatus && (
            <AvailabilityDot status={availabilityStatus} />
          )}
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
            <MapPin className="h-3 w-3 inline-block mr-1 align-middle" aria-hidden />
            {venue.city}
            {venue.area ? ` · ${venue.area}` : ''}
          </p>
        </div>
        <h3 className="text-h3 text-foreground group-hover:text-brand transition-colors font-normal">
          {venue.name}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {venue.capacity != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden />
              Up to {venue.capacity} guests
            </span>
          )}
          {venue.catering_included && <span>Catering included</span>}
        </div>
        <div className="mt-5 h-px bg-border" aria-hidden />
        <div className="mt-5 flex items-end justify-between gap-4 flex-wrap">
          <div>
            {startingPrice != null && (
              <>
                <p className="text-[11px] text-muted uppercase tracking-[0.05em]">From</p>
                <p className="font-display text-xl font-normal text-foreground">
                  {startingPrice} <span className="text-sm font-sans text-muted">PKR/head</span>
                </p>
              </>
            )}
          </div>
          {venue.rating != null && (
            <span className="flex items-center gap-1 text-[13px]">
              <Star className="h-3.5 w-3.5 fill-champagne text-champagne" aria-hidden />
              <span className="font-medium text-foreground">{venue.rating.average}</span>
              <span className="text-muted text-[11px]">({venue.rating.count})</span>
            </span>
          )}
        </div>
        <span className="mt-5 flex min-h-[44px] items-center justify-center border border-border rounded text-[12px] uppercase tracking-[0.08em] text-foreground group-hover:bg-ink group-hover:text-[var(--page-bg)] group-hover:border-ink transition-all duration-300">
          View venue
        </span>
      </div>
    </Link>
  );
}
