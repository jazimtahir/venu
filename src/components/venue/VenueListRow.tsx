'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Star } from 'lucide-react';
import type { Venue } from '@/types/database';
import type { AvailabilityStatus } from '@/lib/availability';
import { WishlistToggle } from './WishlistToggle';
import { RecordVenueImpression } from './RecordVenueImpression';
import type { ImpressionSource } from '@/app/actions/venue-impressions';

interface VenueListRowProps {
  venue: Venue & {
    venue_images?: { image_url: string }[];
    rating?: { average: number; count: number };
  };
  availabilityStatus?: AvailabilityStatus | null;
  wishlistSaved?: boolean;
  impressionSource?: ImpressionSource;
}

function formatPrice(n: number | null) {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function VenueListRow({ venue, availabilityStatus, wishlistSaved = false, impressionSource }: VenueListRowProps) {
  const imageUrl = venue.venue_images?.[0]?.image_url ?? null;
  const perHeadMin =
    venue.per_head_with_catering_min ?? venue.per_head_without_catering_min ?? venue.min_per_head_price ?? null;
  const startingPrice = perHeadMin != null ? formatPrice(perHeadMin) : null;

  const row = (
    <Link
      href={`/venue/${venue.slug}`}
      className="group flex gap-4 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-soft)] hover:border-brand/20 sm:p-4"
    >
      <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-section-alt sm:h-28 sm:w-32">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={venue.name}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <MapPin className="h-8 w-8" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-brand transition-colors">
            {venue.name}
          </h3>
          <WishlistToggle venueId={venue.id} initialSaved={wishlistSaved} variant="card" />
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{venue.city}{venue.area ? ` · ${venue.area}` : ''}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {availabilityStatus && (
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                availabilityStatus === 'available'
                  ? 'bg-emerald-500'
                  : availabilityStatus === 'limited'
                    ? 'bg-amber-500'
                    : 'bg-muted'
              }`}
              title={availabilityStatus === 'available' ? 'Available' : availabilityStatus === 'limited' ? 'Limited dates' : 'Fully booked'}
              aria-hidden
            />
          )}
          {venue.capacity != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden />
              Up to {venue.capacity}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {startingPrice != null && (
            <span className="font-medium text-foreground text-sm">
              From {startingPrice} <span className="text-muted font-normal">PKR/head</span>
            </span>
          )}
          {venue.rating != null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-champagne text-champagne" aria-hidden />
              <span className="font-medium text-foreground">{venue.rating.average}</span>
              <span>({venue.rating.count})</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );

  if (impressionSource) {
    return (
      <>
        <RecordVenueImpression venueId={venue.id} source={impressionSource} />
        {row}
      </>
    );
  }
  return row;
}
