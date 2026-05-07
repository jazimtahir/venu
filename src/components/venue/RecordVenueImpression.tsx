'use client';

import { useEffect, useRef } from 'react';
import { recordVenueImpression, type ImpressionSource } from '@/app/actions/venue-impressions';

export function RecordVenueImpression({ venueId, source }: { venueId: string; source: ImpressionSource }) {
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    recordVenueImpression(venueId, source);
  }, [venueId, source]);
  return null;
}
