'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { BookingStatus } from '@/types/database';
import type { InquiryEventType } from '@/types/database';
import { createNotification, sendVendorEmail, sendEmail } from '@/lib/notifications';

async function getVendorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  return vendor?.id ?? null;
}

export interface CreateBookingInput {
  venue_id: string;
  inquiry_id?: string | null;
  client_name: string;
  client_phone: string;
  client_email?: string | null;
  event_type?: InquiryEventType | null;
  guest_count?: number | null;
  event_date: string;
  venue_slot_id?: string | null;
  selected_floor?: string | null;
  selected_package?: string | null;
  total_amount?: number | null;
  advance_paid?: number;
  booking_status?: BookingStatus;
  notes?: string | null;
}

export async function createBooking(input: CreateBookingInput) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { id: null, error: 'Unauthorized' };

  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', input.venue_id).single();
  if (!venue || venue.vendor_id !== vendorId) return { id: null, error: 'Forbidden' };

  // Bookings created from an inquiry (Convert to booking) are always confirmed
  const status = input.inquiry_id
    ? 'confirmed'
    : (input.booking_status ?? 'confirmed');
  const { data: row, error } = await supabase
    .from('bookings')
    .insert({
      vendor_id: vendorId,
      venue_id: input.venue_id,
      inquiry_id: input.inquiry_id ?? null,
      client_name: input.client_name.trim(),
      client_phone: input.client_phone.trim(),
      client_email: input.client_email?.trim() || null,
      event_type: input.event_type ?? null,
      guest_count: input.guest_count ?? null,
      event_date: input.event_date,
      venue_slot_id: input.venue_slot_id ?? null,
      selected_floor: input.selected_floor ?? null,
      selected_package: input.selected_package ?? null,
      total_amount: input.total_amount ?? null,
      advance_paid: input.advance_paid ?? 0,
      booking_status: status,
      notes: input.notes?.trim() || null,
    })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };

  // When booking was created from an inquiry, set inquiry status to confirmed
  if (row && input.inquiry_id) {
    await supabase.from('inquiries').update({ status: 'confirmed' }).eq('id', input.inquiry_id);
  }

  if (status === 'confirmed' && row) {
    const { data: venue } = await supabase.from('venues').select('name').eq('id', input.venue_id).single();
    const venueName = venue?.name ?? 'Venue';
    await createNotification(
      vendorId,
      'booking_confirmed',
      'Booking confirmed',
      `${input.client_name} – ${input.event_date} – ${venueName}`,
      row.id
    );
    await sendVendorEmail(
      vendorId,
      'Booking confirmed',
      `A booking has been confirmed.\nClient: ${input.client_name}\nPhone: ${input.client_phone}\nEvent date: ${input.event_date}\nVenue: ${venueName}`
    );
    if (input.client_email?.trim()) {
      await sendEmail(
        input.client_email.trim(),
        'Booking confirmation',
        `Your booking has been confirmed.\n\nEvent date: ${input.event_date}\nVenue: ${venueName}\n\nContact: ${input.client_phone}`
      );
    }
  }
  revalidatePath('/vendor/dashboard/bookings');
  revalidatePath('/vendor/dashboard');
  revalidatePath('/vendor/dashboard/calendar');
  revalidatePath('/vendor/dashboard/inquiries');
  return { id: row.id, error: null };
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { error: 'Unauthorized' };

  const { data: booking } = await supabase.from('bookings').select('vendor_id').eq('id', bookingId).single();
  if (!booking || booking.vendor_id !== vendorId) return { error: 'Forbidden' };

  const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', bookingId);
  if (error) return { error: error.message };
  if (status === 'confirmed') {
    const { data: full } = await supabase
      .from('bookings')
      .select('client_name, client_phone, client_email, event_date, venue_id')
      .eq('id', bookingId)
      .single();
    const { data: venue } = full
      ? await supabase.from('venues').select('name').eq('id', full.venue_id).single()
      : { data: null };
    const venueName = venue?.name ?? 'Venue';
    await createNotification(
      vendorId,
      'booking_confirmed',
      'Booking confirmed',
      full ? `${full.client_name} – ${full.event_date} – ${venueName}` : 'Booking confirmed',
      bookingId
    );
    await sendVendorEmail(
      vendorId,
      'Booking confirmed',
      full
        ? `A booking has been confirmed.\nClient: ${full.client_name}\nPhone: ${full.client_phone}\nEvent date: ${full.event_date}\nVenue: ${venueName}`
        : 'A booking has been confirmed.'
    );
    if (full?.client_email?.trim()) {
      await sendEmail(
        full.client_email.trim(),
        'Booking confirmation',
        `Your booking has been confirmed.\n\nEvent date: ${full.event_date}\nVenue: ${venueName}\n\nContact: ${full.client_phone}`
      );
    }
  }
  revalidatePath('/vendor/dashboard/bookings');
  revalidatePath('/vendor/dashboard');
  revalidatePath('/vendor/dashboard/calendar');
  return {};
}

export async function updateBookingPayment(bookingId: string, advancePaid: number) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { error: 'Unauthorized' };

  const { data: booking } = await supabase.from('bookings').select('vendor_id').eq('id', bookingId).single();
  if (!booking || booking.vendor_id !== vendorId) return { error: 'Forbidden' };

  const { error } = await supabase.from('bookings').update({ advance_paid: advancePaid }).eq('id', bookingId);
  if (error) return { error: error.message };
  revalidatePath('/vendor/dashboard/bookings');
  revalidatePath('/vendor/dashboard');
  revalidatePath('/vendor/dashboard/calendar');
  return {};
}

export async function cancelBooking(bookingId: string) {
  return updateBookingStatus(bookingId, 'cancelled');
}

export interface GetVendorBookingsFilters {
  status?: BookingStatus;
  from_date?: string;
  to_date?: string;
  venue_id?: string;
  event_type?: InquiryEventType;
}

export async function getVendorBookings(filters?: GetVendorBookingsFilters) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { data: [], error: 'Unauthorized' };

  let q = supabase
    .from('bookings')
    .select(`
      id,
      venue_id,
      inquiry_id,
      client_name,
      client_phone,
      client_email,
      event_type,
      guest_count,
      event_date,
      venue_slot_id,
      selected_floor,
      selected_package,
      total_amount,
      advance_paid,
      booking_status,
      notes,
      created_at,
      venues ( id, name, slug ),
      venue_floors ( id, name ),
      venue_catering_packages ( id, name ),
      venue_slots ( id, name )
    `)
    .eq('vendor_id', vendorId)
    .order('event_date', { ascending: true })
    .order('created_at', { ascending: false });

  if (filters?.status) q = q.eq('booking_status', filters.status);
  if (filters?.from_date) q = q.gte('event_date', filters.from_date);
  if (filters?.to_date) q = q.lte('event_date', filters.to_date);
  if (filters?.venue_id) q = q.eq('venue_id', filters.venue_id);
  if (filters?.event_type) q = q.eq('event_type', filters.event_type);

  const { data, error } = await q;
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function getVendorBookingById(bookingId: string) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { data: null, error: 'Unauthorized' };

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id,
      vendor_id,
      venue_id,
      inquiry_id,
      client_name,
      client_phone,
      client_email,
      event_type,
      guest_count,
      event_date,
      venue_slot_id,
      selected_floor,
      selected_package,
      total_amount,
      advance_paid,
      booking_status,
      notes,
      created_at,
      venues ( id, name, slug ),
      venue_floors ( id, name ),
      venue_catering_packages ( id, name ),
      venue_slots ( id, name, start_time, end_time )
    `)
    .eq('id', bookingId)
    .eq('vendor_id', vendorId)
    .single();

  if (error || !booking) return { data: null, error: error?.message ?? 'Not found' };
  return { data: booking, error: null };
}

/** Get slots, floors, packages for a venue (for booking form dropdowns). */
export async function getVenueBookingOptions(venueId: string) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { data: null, error: 'Unauthorized' };

  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue || venue.vendor_id !== vendorId) return { data: null, error: 'Forbidden' };

  const [slotsRes, floorsRes, packagesRes] = await Promise.all([
    supabase.from('venue_slots').select('id, name, start_time, end_time').eq('venue_id', venueId).order('display_order'),
    supabase.from('venue_floors').select('id, name').eq('venue_id', venueId).order('display_order'),
    supabase.from('venue_catering_packages').select('id, name').eq('venue_id', venueId).order('display_order'),
  ]);
  return {
    data: {
      slots: slotsRes.data ?? [],
      floors: floorsRes.data ?? [],
      packages: packagesRes.data ?? [],
    },
    error: null,
  };
}

/** Bookings for calendar view (month + optional venue/floor/slot/package filter). */
export async function getVendorBookingsForCalendar(
  year: number,
  month: number,
  venueId?: string | null,
  floorId?: string | null,
  slotId?: string | null,
  packageId?: string | null
) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { data: [], error: 'Unauthorized' };

  const start = new Date(year, month - 1, 1);
  const fromStr = start.toISOString().slice(0, 10);
  const end = new Date(year, month, 0);
  const toStr = end.toISOString().slice(0, 10);

  let q = supabase
    .from('bookings')
    .select(`
      id,
      venue_id,
      event_date,
      event_type,
      client_name,
      booking_status,
      venue_slot_id,
      selected_floor,
      selected_package,
      venues ( id, name, slug ),
      venue_floors ( id, name ),
      venue_slots ( id, name, start_time, end_time ),
      venue_catering_packages ( id, name )
    `)
    .eq('vendor_id', vendorId)
    .eq('booking_status', 'confirmed')
    .gte('event_date', fromStr)
    .lte('event_date', toStr)
    .order('event_date');

  if (venueId) q = q.eq('venue_id', venueId);
  if (floorId) q = q.eq('selected_floor', floorId);
  if (slotId) q = q.eq('venue_slot_id', slotId);
  if (packageId) q = q.eq('selected_package', packageId);

  const { data, error } = await q;
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function getBlockedDates(
  venueId: string | null,
  fromDate: string,
  toDate: string
) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { data: [], error: 'Unauthorized' };

  let q = supabase
    .from('blocked_dates')
    .select('id, venue_id, date, reason')
    .eq('vendor_id', vendorId)
    .gte('date', fromDate)
    .lte('date', toDate);

  if (venueId) q = q.eq('venue_id', venueId);
  const { data, error } = await q;
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function createBlockedDate(venueId: string, date: string, reason?: string | null) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { error: 'Unauthorized' };

  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue || venue.vendor_id !== vendorId) return { error: 'Forbidden' };

  const { error } = await supabase.from('blocked_dates').insert({
    vendor_id: vendorId,
    venue_id: venueId,
    date,
    reason: reason?.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath('/vendor/dashboard/calendar');
  return {};
}

export async function deleteBlockedDate(blockedDateId: string) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { error: 'Unauthorized' };

  const { data: row } = await supabase
    .from('blocked_dates')
    .select('vendor_id')
    .eq('id', blockedDateId)
    .single();
  if (!row || row.vendor_id !== vendorId) return { error: 'Forbidden' };

  const { error } = await supabase.from('blocked_dates').delete().eq('id', blockedDateId);
  if (error) return { error: error.message };
  revalidatePath('/vendor/dashboard/calendar');
  return {};
}

/** Pre-fill booking from inquiry; returns payload for createBooking / new booking form. */
export async function convertInquiryToBooking(inquiryId: string) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { data: null, error: 'Unauthorized' };

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select(`
      id,
      venue_id,
      name,
      phone,
      event_date,
      event_type,
      preferred_slot_id,
      floor_id,
      interested_package_id,
      message
    `)
    .eq('id', inquiryId)
    .single();

  if (error || !inquiry) return { data: null, error: error?.message ?? 'Not found' };

  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', inquiry.venue_id).single();
  if (!venue || venue.vendor_id !== vendorId) return { data: null, error: 'Forbidden' };

  const payload: CreateBookingInput = {
    venue_id: inquiry.venue_id,
    inquiry_id: inquiry.id,
    client_name: inquiry.name,
    client_phone: inquiry.phone,
    client_email: null,
    event_type: inquiry.event_type ?? undefined,
    guest_count: null,
    event_date: inquiry.event_date ?? '',
    venue_slot_id: inquiry.preferred_slot_id ?? undefined,
    selected_floor: inquiry.floor_id ?? undefined,
    selected_package: inquiry.interested_package_id ?? undefined,
    total_amount: null,
    advance_paid: 0,
    booking_status: 'confirmed',
    notes: inquiry.message?.trim() || null,
  };
  return { data: payload, error: null };
}
