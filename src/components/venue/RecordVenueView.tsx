'use client';

import { useEffect, useRef } from 'react';
import { recordVenueView } from '@/app/actions/venue-views';

export function RecordVenueView({ venueId }: { venueId: string }) {
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    recordVenueView(venueId);
  }, [venueId]);
  return null;
}
