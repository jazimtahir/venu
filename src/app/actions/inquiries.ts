'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { InquiryStatus, InquirySource } from '@/types/database';

async function getVendorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  return vendor?.id ?? null;
}

async function assertInquiryOwnership(supabase: Awaited<ReturnType<typeof createClient>>, inquiryId: string, vendorId: string) {
  const { data: inquiry } = await supabase.from('inquiries').select('venue_id').eq('id', inquiryId).single();
  if (!inquiry) return false;
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', inquiry.venue_id).single();
  return venue?.vendor_id === vendorId;
}

export interface GetVendorInquiriesFilters {
  status?: InquiryStatus;
  source?: InquirySource;
  venue_id?: string;
}

export async function getVendorInquiries(filters?: GetVendorInquiriesFilters) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { data: [], error: 'Unauthorized' };

  const { data: venues } = await supabase.from('venues').select('id, name, slug').eq('vendor_id', vendorId);
  const venueIds = (venues ?? []).map((v) => v.id);
  if (venueIds.length === 0) return { data: [], error: null };

  let q = supabase
    .from('inquiries')
    .select(`
      id,
      venue_id,
      name,
      phone,
      event_date,
      message,
      created_at,
      interested_package_id,
      floor_id,
      event_type,
      status,
      expected_price,
      source,
      venues ( name, slug ),
      venue_catering_packages ( name, per_head_price ),
      venue_floors ( name, capacity )
    `)
    .in('venue_id', venueIds)
    .order('created_at', { ascending: false });

  if (filters?.status) q = q.eq('status', filters.status);
  if (filters?.source) q = q.eq('source', filters.source);
  if (filters?.venue_id) q = q.eq('venue_id', filters.venue_id);

  const { data: inquiries, error } = await q;
  if (error) return { data: [], error: error.message };
  return { data: inquiries ?? [], error: null };
}

export async function getVendorInquiryById(inquiryId: string) {
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
      message,
      created_at,
      interested_package_id,
      floor_id,
      event_type,
      status,
      expected_price,
      source,
      venues ( id, name, slug ),
      venue_catering_packages ( id, name, per_head_price ),
      venue_floors ( id, name, capacity )
    `)
    .eq('id', inquiryId)
    .single();

  if (error || !inquiry) return { data: null, error: error?.message ?? 'Not found' };

  const venuesData = inquiry.venues as { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
  const venue = Array.isArray(venuesData) ? venuesData[0] ?? null : venuesData;
  const venueId = venue?.id ?? (inquiry as { venue_id: string }).venue_id;
  const { data: venueRow } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (venueRow?.vendor_id !== vendorId) return { data: null, error: 'Forbidden' };

  const { data: notes } = await supabase
    .from('inquiry_notes')
    .select('id, note, created_at')
    .eq('inquiry_id', inquiryId)
    .order('created_at', { ascending: true });

  const { data: confirmedBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('inquiry_id', inquiryId)
    .eq('booking_status', 'confirmed')
    .limit(1)
    .maybeSingle();

  return { data: { ...inquiry, inquiry_notes: notes ?? [], has_confirmed_booking: !!confirmedBooking }, error: null };
}

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { error: 'Unauthorized' };
  if (!(await assertInquiryOwnership(supabase, inquiryId, vendorId))) return { error: 'Forbidden' };

  const { error } = await supabase.from('inquiries').update({ status }).eq('id', inquiryId);
  if (error) return { error: error.message };
  revalidatePath('/vendor/dashboard/inquiries');
  revalidatePath('/vendor/dashboard');
  return {};
}

export async function updateInquiryExpectedPrice(inquiryId: string, value: number | null) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { error: 'Unauthorized' };
  if (!(await assertInquiryOwnership(supabase, inquiryId, vendorId))) return { error: 'Forbidden' };

  const { error } = await supabase.from('inquiries').update({ expected_price: value }).eq('id', inquiryId);
  if (error) return { error: error.message };
  revalidatePath('/vendor/dashboard/inquiries');
  revalidatePath('/vendor/dashboard');
  return {};
}

export async function updateInquirySource(inquiryId: string, source: InquirySource) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { error: 'Unauthorized' };
  if (!(await assertInquiryOwnership(supabase, inquiryId, vendorId))) return { error: 'Forbidden' };

  const { error } = await supabase.from('inquiries').update({ source }).eq('id', inquiryId);
  if (error) return { error: error.message };
  revalidatePath('/vendor/dashboard/inquiries');
  revalidatePath('/vendor/dashboard');
  return {};
}

export async function addInquiryNote(inquiryId: string, note: string) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { error: 'Unauthorized' };
  if (!(await assertInquiryOwnership(supabase, inquiryId, vendorId))) return { error: 'Forbidden' };
  if (!note.trim()) return { error: 'Note is required' };

  const { error } = await supabase.from('inquiry_notes').insert({ inquiry_id: inquiryId, vendor_id: vendorId, note: note.trim() });
  if (error) return { error: error.message };
  revalidatePath('/vendor/dashboard/inquiries');
  return {};
}

/** Count of inquiries with status = new and created_at today (for nav badge). */
export async function getNewInquiriesCountToday() {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return 0;

  const { data: venues } = await supabase.from('venues').select('id').eq('vendor_id', vendorId);
  const venueIds = (venues ?? []).map((v) => v.id);
  if (venueIds.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .in('venue_id', venueIds)
    .eq('status', 'new')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`);

  if (error) return 0;
  return count ?? 0;
}
