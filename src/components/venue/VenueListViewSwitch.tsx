'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';
import { VenueCard } from './VenueCard';
import { VenueListRow } from './VenueListRow';
import type { Venue } from '@/types/database';
import type { AvailabilityStatus } from '@/lib/availability';

type ViewMode = 'list' | 'cards';

interface VenueListViewSwitchProps {
  venues: (Venue & {
    venue_images?: { image_url: string }[];
    rating?: { average: number; count: number };
  })[];
  availabilityStatuses: Record<string, AvailabilityStatus | null>;
  wishlistSet: Set<string>;
}

export function VenueListViewSwitch({
  venues,
  availabilityStatuses,
  wishlistSet,
}: VenueListViewSwitchProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewFromUrl: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'cards';
  const [view, setViewState] = useState<ViewMode>(viewFromUrl);

  useEffect(() => {
    setViewState(viewFromUrl);
  }, [viewFromUrl]);

  const setView = (next: ViewMode) => {
    if (next === view) return;
    setViewState(next);
    const url = next === 'list' ? `${pathname}?view=list` : pathname;
    window.history.replaceState(null, '', url);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex items-center justify-end gap-1 rounded-lg border border-border bg-section-alt/50 p-1 w-fit">
        <button
          type="button"
          onClick={() => setView('cards')}
          aria-pressed={view === 'cards'}
          aria-label="Card view"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            view === 'cards'
              ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Cards</span>
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          aria-pressed={view === 'list'}
          aria-label="List view"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            view === 'list'
              ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">List</span>
        </button>
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3 2xl:gap-8">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              availabilityStatus={availabilityStatuses[venue.id]}
              wishlistSaved={wishlistSet.has(venue.id)}
              impressionSource="list"
            />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-3 sm:gap-4 list-none p-0 m-0">
          {venues.map((venue) => (
            <li key={venue.id}>
              <VenueListRow
                venue={venue}
                availabilityStatus={availabilityStatuses[venue.id]}
                wishlistSaved={wishlistSet.has(venue.id)}
                impressionSource="list"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
