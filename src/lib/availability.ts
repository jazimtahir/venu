import { createClient } from '@/lib/supabase/server';

export interface DateSlotAvailability {
  date: string;
  slots: { slotId: string; slotName: string; available: boolean }[];
}

/**
 * Returns per-date, per-slot availability for a venue in a given month.
 * A slot is unavailable if it's in venue_slot_blocks OR there's a confirmed booking for that venue/date/slot.
 */
export async function getVenueAvailability(
  venueId: string,
  year: number,
  month: number
): Promise<{ dates: DateSlotAvailability[]; error?: string }> {
  const supabase = await createClient();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const fromStr = start.toISOString().slice(0, 10);
  const toStr = end.toISOString().slice(0, 10);
  const numDays = end.getDate();

  const [slotsRes, blocksRes, bookingsRes] = await Promise.all([
    supabase
      .from('venue_slots')
      .select('id, name')
      .eq('venue_id', venueId)
      .order('display_order'),
    supabase
      .from('venue_slot_blocks')
      .select('slot_date, venue_slot_id')
      .eq('venue_id', venueId)
      .gte('slot_date', fromStr)
      .lte('slot_date', toStr),
    supabase
      .from('bookings')
      .select('event_date, venue_slot_id')
      .eq('venue_id', venueId)
      .eq('booking_status', 'confirmed')
      .gte('event_date', fromStr)
      .lte('event_date', toStr),
  ]);

  const slots = (slotsRes.data ?? []) as { id: string; name: string }[];
  const blocks = (blocksRes.data ?? []) as { slot_date: string; venue_slot_id: string }[];
  const bookings = (bookingsRes.data ?? []) as { event_date: string; venue_slot_id: string | null }[];

  const blockedSet = new Set(blocks.map((b) => `${b.slot_date}:${b.venue_slot_id}`));
  const bookedSet = new Set(
    bookings.filter((b) => b.venue_slot_id).map((b) => `${b.event_date}:${b.venue_slot_id}`)
  );

  const dates: DateSlotAvailability[] = [];
  for (let d = 1; d <= numDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dates.push({
      date: dateStr,
      slots: slots.map((s) => ({
        slotId: s.id,
        slotName: s.name,
        available: !blockedSet.has(`${dateStr}:${s.id}`) && !bookedSet.has(`${dateStr}:${s.id}`),
      })),
    });
  }
  return { dates };
}

/**
 * Returns whether a specific slot on a date is available (no block, no confirmed booking).
 */
export async function isVenueAvailable(
  venueId: string,
  date: string,
  slotId: string
): Promise<boolean> {
  const supabase = await createClient();
  const [blockRes, bookingRes] = await Promise.all([
    supabase
      .from('venue_slot_blocks')
      .select('id')
      .eq('venue_id', venueId)
      .eq('slot_date', date)
      .eq('venue_slot_id', slotId)
      .maybeSingle(),
    supabase
      .from('bookings')
      .select('id')
      .eq('venue_id', venueId)
      .eq('event_date', date)
      .eq('venue_slot_id', slotId)
      .eq('booking_status', 'confirmed')
      .maybeSingle(),
  ]);
  return !blockRes.data && !bookingRes.data;
}

export type AvailabilityStatus = 'available' | 'limited' | 'fully_booked';

/**
 * Shared logic: given slot ids and blocked/booked sets, compute status for date range.
 * - available: at least 7 days with at least one free slot
 * - limited: at least 1 day with a free slot but fewer than 7
 * - fully_booked: no days with any free slot
 */
function computeAvailabilityStatus(
  slotIds: string[],
  blockedSet: Set<string>,
  bookedSet: Set<string>,
  from: Date,
  to: Date
): AvailabilityStatus {
  if (slotIds.length === 0) return 'available';
  let daysWithFreeSlot = 0;
  const current = new Date(from);
  while (current <= to) {
    const dateStr = current.toISOString().slice(0, 10);
    const hasFree = slotIds.some(
      (sid) => !blockedSet.has(`${dateStr}:${sid}`) && !bookedSet.has(`${dateStr}:${sid}`)
    );
    if (hasFree) daysWithFreeSlot++;
    current.setDate(current.getDate() + 1);
  }
  if (daysWithFreeSlot >= 7) return 'available';
  if (daysWithFreeSlot >= 1) return 'limited';
  return 'fully_booked';
}

/**
 * For listing cards: compute availability status for the next N days.
 * - available: at least 7 days with at least one free slot
 * - limited: at least 1 day with a free slot but fewer than 7
 * - fully_booked: no days with any free slot
 */
export async function getVenueAvailabilityStatus(
  venueId: string,
  nextDays: number = 30
): Promise<AvailabilityStatus> {
  const today = new Date();
  const from = new Date(today);
  const to = new Date(today);
  to.setDate(to.getDate() + nextDays);

  const supabase = await createClient();
  const [slotsRes, blocksRes, bookingsRes] = await Promise.all([
    supabase.from('venue_slots').select('id').eq('venue_id', venueId),
    supabase
      .from('venue_slot_blocks')
      .select('slot_date, venue_slot_id')
      .eq('venue_id', venueId)
      .gte('slot_date', from.toISOString().slice(0, 10))
      .lte('slot_date', to.toISOString().slice(0, 10)),
    supabase
      .from('bookings')
      .select('event_date, venue_slot_id')
      .eq('venue_id', venueId)
      .eq('booking_status', 'confirmed')
      .gte('event_date', from.toISOString().slice(0, 10))
      .lte('event_date', to.toISOString().slice(0, 10)),
  ]);

  const slotIds = (slotsRes.data ?? []).map((s) => (s as { id: string }).id);
  const blockedSet = new Set(
    (blocksRes.data ?? []).map((b: { slot_date: string; venue_slot_id: string }) => `${b.slot_date}:${b.venue_slot_id}`)
  );
  const bookedSet = new Set(
    (bookingsRes.data ?? [])
      .filter((b: { venue_slot_id: string | null }) => b.venue_slot_id)
      .map((b: { event_date: string; venue_slot_id: string }) => `${b.event_date}:${b.venue_slot_id}`)
  );

  return computeAvailabilityStatus(slotIds, blockedSet, bookedSet, from, to);
}

/** Batch version for listing pages: 3 queries total, then status per venue id. */
export async function getVenueAvailabilityStatusBatch(
  venueIds: string[],
  nextDays: number = 30
): Promise<Record<string, AvailabilityStatus>> {
  if (venueIds.length === 0) return {};

  const today = new Date();
  const from = new Date(today);
  const to = new Date(today);
  to.setDate(to.getDate() + nextDays);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  const supabase = await createClient();
  const [slotsRes, blocksRes, bookingsRes] = await Promise.all([
    supabase.from('venue_slots').select('id, venue_id').in('venue_id', venueIds),
    supabase
      .from('venue_slot_blocks')
      .select('slot_date, venue_slot_id, venue_id')
      .in('venue_id', venueIds)
      .gte('slot_date', fromStr)
      .lte('slot_date', toStr),
    supabase
      .from('bookings')
      .select('event_date, venue_slot_id, venue_id')
      .in('venue_id', venueIds)
      .eq('booking_status', 'confirmed')
      .gte('event_date', fromStr)
      .lte('event_date', toStr),
  ]);

  type SlotRow = { id: string; venue_id: string };
  type BlockRow = { slot_date: string; venue_slot_id: string; venue_id: string };
  type BookingRow = { event_date: string; venue_slot_id: string | null; venue_id: string };

  const slotsByVenue = new Map<string, string[]>();
  for (const row of (slotsRes.data ?? []) as SlotRow[]) {
    const arr = slotsByVenue.get(row.venue_id) ?? [];
    arr.push(row.id);
    slotsByVenue.set(row.venue_id, arr);
  }

  const blockedByVenue = new Map<string, Set<string>>();
  for (const row of (blocksRes.data ?? []) as BlockRow[]) {
    let set = blockedByVenue.get(row.venue_id);
    if (!set) {
      set = new Set();
      blockedByVenue.set(row.venue_id, set);
    }
    set.add(`${row.slot_date}:${row.venue_slot_id}`);
  }

  const bookedByVenue = new Map<string, Set<string>>();
  for (const row of (bookingsRes.data ?? []) as BookingRow[]) {
    if (!row.venue_slot_id) continue;
    let set = bookedByVenue.get(row.venue_id);
    if (!set) {
      set = new Set();
      bookedByVenue.set(row.venue_id, set);
    }
    set.add(`${row.event_date}:${row.venue_slot_id}`);
  }

  const result: Record<string, AvailabilityStatus> = {};
  for (const venueId of venueIds) {
    const slotIds = slotsByVenue.get(venueId) ?? [];
    const blockedSet = blockedByVenue.get(venueId) ?? new Set();
    const bookedSet = bookedByVenue.get(venueId) ?? new Set();
    result[venueId] = computeAvailabilityStatus(slotIds, blockedSet, bookedSet, from, to);
  }
  return result;
}
