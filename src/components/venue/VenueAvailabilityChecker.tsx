'use client';

import { useState, useCallback } from 'react';
import { getVenueSlotAvailability } from '@/app/actions/venue';
import type { VenueSlot } from '@/types/database';
import { DatePicker } from '@/components/ui/date-picker';

interface VenueAvailabilityCheckerProps {
  venueId: string;
  offeredSlots: VenueSlot[];
}

export function VenueAvailabilityChecker({ venueId, offeredSlots }: VenueAvailabilityCheckerProps) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<{ slotId: string; slotName: string; startTime: string; endTime: string; available: boolean }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = useCallback(
    async (value: string) => {
      setDate(value);
      if (!value) {
        setSlots(null);
        return;
      }
      setLoading(true);
      const result = await getVenueSlotAvailability(venueId, value);
      setLoading(false);
      setSlots(result.slots ?? null);
    },
    [venueId]
  );

  if (offeredSlots.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mb-6">
      <h3 className="text-h3 text-foreground mb-3">Check availability</h3>
      <div>
        <label htmlFor="availability-date" className="block text-sm font-medium text-foreground mb-1.5">
          Select a date
        </label>
        <DatePicker
          id="availability-date"
          value={date}
          onChange={handleDateChange}
          placeholder="Pick a date"
          min={today}
          className="w-full"
        />
      </div>
      {loading && <p className="mt-2 text-sm text-muted-foreground">Checking…</p>}
      {!loading && date && slots && slots.length > 0 && (
        <ul className="mt-3 space-y-2">
          {slots.map(({ slotId, slotName, available }) => (
            <li
              key={slotId}
              className="flex items-center justify-between text-sm rounded border border-border bg-section-alt px-3 py-2"
            >
              <span className="font-medium text-foreground">{slotName}</span>
              <span
                className={available ? 'text-sage font-medium' : 'text-muted-foreground'}
              >
                {available ? 'Available' : 'Booked'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
