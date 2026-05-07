'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { venueSlug } from '@/utils/slug';
import type { VenueType } from '@/types/database';

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin';
}

interface CreateVenueInput {
  vendorId: string;
  name: string;
  city: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  venueType: VenueType;
  description?: string;
  address?: string;
  googleMapsLink?: string;
  cateringIncluded?: boolean;
  minPerHeadPrice?: number;
  maxPerHeadPrice?: number;
  perHeadWithCateringMin?: number;
  perHeadWithCateringMax?: number;
  perHeadWithoutCateringMin?: number;
  perHeadWithoutCateringMax?: number;
}

export async function createVenue(input: CreateVenueInput): Promise<{ id: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { id: '', error: 'Unauthorized' };

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  if (!vendor || vendor.id !== input.vendorId) return { id: '', error: 'Forbidden' };

  const { data: inserted, error } = await supabase
    .from('venues')
    .insert({
      vendor_id: input.vendorId,
      name: input.name,
      slug: 'temp', // will update
      city: input.city,
      area: input.area || null,
      min_price: input.minPrice ?? null,
      max_price: input.maxPrice ?? null,
      capacity: input.capacity ?? null,
      venue_type: input.venueType,
      description: input.description || null,
      address: input.address || null,
      google_maps_link: input.googleMapsLink || null,
      catering_included: input.cateringIncluded ?? false,
      min_per_head_price: input.minPerHeadPrice ?? null,
      max_per_head_price: input.maxPerHeadPrice ?? null,
      per_head_with_catering_min: input.perHeadWithCateringMin ?? null,
      per_head_with_catering_max: input.perHeadWithCateringMax ?? null,
      per_head_without_catering_min: input.perHeadWithoutCateringMin ?? null,
      per_head_without_catering_max: input.perHeadWithoutCateringMax ?? null,
    })
    .select('id')
    .single();

  if (error) return { id: '', error: error.message };
  const slug = venueSlug(input.name, inserted.id);
  await supabase.from('venues').update({ slug }).eq('id', inserted.id);
  return { id: inserted.id };
}

interface UpdateVenueInput {
  venueId: string;
  name: string;
  city: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  venueType: VenueType;
  description?: string;
  address?: string;
  googleMapsLink?: string;
  cateringIncluded?: boolean;
  minPerHeadPrice?: number;
  maxPerHeadPrice?: number;
  perHeadWithCateringMin?: number;
  perHeadWithCateringMax?: number;
  perHeadWithoutCateringMin?: number;
  perHeadWithoutCateringMax?: number;
}

export async function updateVenue(input: UpdateVenueInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: venue } = await supabase
    .from('venues')
    .select('id, vendor_id')
    .eq('id', input.venueId)
    .single();
  if (!venue) return { error: 'Not found' };

  const admin = await isAdmin(supabase);
  if (!admin) {
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor || venue.vendor_id !== vendor.id) return { error: 'Forbidden' };
  }

  const slug = venueSlug(input.name, input.venueId);
  const { error } = await supabase
    .from('venues')
    .update({
      name: input.name,
      slug,
      city: input.city,
      area: input.area || null,
      min_price: input.minPrice ?? null,
      max_price: input.maxPrice ?? null,
      capacity: input.capacity ?? null,
      venue_type: input.venueType,
      description: input.description || null,
      address: input.address || null,
      google_maps_link: input.googleMapsLink || null,
      catering_included: input.cateringIncluded ?? false,
      min_per_head_price: input.minPerHeadPrice ?? null,
      max_per_head_price: input.maxPerHeadPrice ?? null,
      per_head_with_catering_min: input.perHeadWithCateringMin ?? null,
      per_head_with_catering_max: input.perHeadWithCateringMax ?? null,
      per_head_without_catering_min: input.perHeadWithoutCateringMin ?? null,
      per_head_without_catering_max: input.perHeadWithoutCateringMax ?? null,
    })
    .eq('id', input.venueId);

  return { error: error?.message };
}

export async function addVenueFeature(venueId: string, featureName: string): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return { error: 'Not found' };
  const admin = await isAdmin(supabase);
  if (!admin) {
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor || venue.vendor_id !== vendor.id) return { error: 'Forbidden' };
  }
  const { data: row, error } = await supabase.from('venue_features').insert({ venue_id: venueId, feature_name: featureName }).select('id').single();
  if (error) return { error: error.message };
  return { id: row.id };
}

export async function addVenueFeaturesBulk(
  venueId: string,
  featureNames: string[]
): Promise<{ data?: { id: string; feature_name: string }[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return { error: 'Not found' };
  const admin = await isAdmin(supabase);
  if (!admin) {
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor || venue.vendor_id !== vendor.id) return { error: 'Forbidden' };
  }
  const toInsert = featureNames.filter(Boolean).map((name) => ({ venue_id: venueId, feature_name: name.trim() }));
  if (toInsert.length === 0) return { data: [] };
  const { data: rows, error } = await supabase
    .from('venue_features')
    .insert(toInsert)
    .select('id, feature_name');
  if (error) return { error: error.message };
  return { data: rows ?? [] };
}

export async function removeVenueFeature(featureId: string, venueId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return { error: 'Not found' };
  const admin = await isAdmin(supabase);
  if (!admin) {
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor || venue.vendor_id !== vendor.id) return { error: 'Forbidden' };
  }
  const { error } = await supabase.from('venue_features').delete().eq('id', featureId);
  return { error: error?.message };
}

async function canManageVenueCatering(supabase: Awaited<ReturnType<typeof createClient>>, venueId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return false;
  const admin = await isAdmin(supabase);
  if (admin) return true;
  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  return !!vendor && venue.vendor_id === vendor.id;
}

export async function addVenueCateringPackage(
  venueId: string,
  input: { name: string; perHeadPrice: number; description?: string; menuText?: string; displayOrder?: number }
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueCatering(supabase, venueId))) return { error: 'Forbidden' };
  const { data: row, error } = await supabase
    .from('venue_catering_packages')
    .insert({
      venue_id: venueId,
      name: input.name,
      per_head_price: input.perHeadPrice,
      description: input.description || null,
      menu_text: input.menuText || null,
      display_order: input.displayOrder ?? 0,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: row.id };
}

export async function updateVenueCateringPackage(
  packageId: string,
  venueId: string,
  input: { name?: string; perHeadPrice?: number; description?: string; menuText?: string; displayOrder?: number }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueCatering(supabase, venueId))) return { error: 'Forbidden' };
  const { error } = await supabase
    .from('venue_catering_packages')
    .update({
      ...(input.name != null && { name: input.name }),
      ...(input.perHeadPrice != null && { per_head_price: input.perHeadPrice }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.menuText !== undefined && { menu_text: input.menuText || null }),
      ...(input.displayOrder != null && { display_order: input.displayOrder }),
    })
    .eq('id', packageId)
    .eq('venue_id', venueId);
  return { error: error?.message };
}

export async function removeVenueCateringPackage(packageId: string, venueId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueCatering(supabase, venueId))) return { error: 'Forbidden' };
  const { error } = await supabase
    .from('venue_catering_packages')
    .delete()
    .eq('id', packageId)
    .eq('venue_id', venueId);
  return { error: error?.message };
}

async function canManageVenueFloors(supabase: Awaited<ReturnType<typeof createClient>>, venueId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return false;
  const admin = await isAdmin(supabase);
  if (admin) return true;
  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  return !!vendor && venue.vendor_id === vendor.id;
}

export async function addVenueFloor(
  venueId: string,
  input: { name: string; capacity?: number; displayOrder?: number }
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueFloors(supabase, venueId))) return { error: 'Forbidden' };
  const { data: rows } = await supabase.from('venue_floors').select('display_order').eq('venue_id', venueId).order('display_order', { ascending: false }).limit(1);
  const nextOrder = (rows?.[0]?.display_order ?? -1) + 1;
  const { data: row, error } = await supabase
    .from('venue_floors')
    .insert({
      venue_id: venueId,
      name: input.name,
      capacity: input.capacity ?? null,
      display_order: input.displayOrder ?? nextOrder,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: row.id };
}

export async function updateVenueFloor(
  floorId: string,
  venueId: string,
  input: { name?: string; capacity?: number; displayOrder?: number }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueFloors(supabase, venueId))) return { error: 'Forbidden' };
  const update: Record<string, unknown> = {};
  if (input.name != null) update.name = input.name;
  if (input.capacity !== undefined) update.capacity = input.capacity ?? null;
  if (input.displayOrder != null) update.display_order = input.displayOrder;
  const { error } = await supabase.from('venue_floors').update(update).eq('id', floorId).eq('venue_id', venueId);
  return { error: error?.message };
}

export async function removeVenueFloor(floorId: string, venueId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueFloors(supabase, venueId))) return { error: 'Forbidden' };
  const { error } = await supabase.from('venue_floors').delete().eq('id', floorId).eq('venue_id', venueId);
  return { error: error?.message };
}

async function canManageVenueSlots(supabase: Awaited<ReturnType<typeof createClient>>, venueId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return false;
  const admin = await isAdmin(supabase);
  if (admin) return true;
  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  return !!vendor && venue.vendor_id === vendor.id;
}

export async function addVenueSlot(
  venueId: string,
  input: { name: string; startTime: string; endTime: string; displayOrder?: number }
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueSlots(supabase, venueId))) return { error: 'Forbidden' };
  const { data: rows } = await supabase.from('venue_slots').select('display_order').eq('venue_id', venueId).order('display_order', { ascending: false }).limit(1);
  const nextOrder = (rows?.[0]?.display_order ?? -1) + 1;
  const { data: row, error } = await supabase
    .from('venue_slots')
    .insert({
      venue_id: venueId,
      name: input.name,
      start_time: input.startTime,
      end_time: input.endTime,
      display_order: input.displayOrder ?? nextOrder,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: row.id };
}

export async function updateVenueSlot(
  slotId: string,
  venueId: string,
  input: { name?: string; startTime?: string; endTime?: string; displayOrder?: number }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueSlots(supabase, venueId))) return { error: 'Forbidden' };
  const update: Record<string, unknown> = {};
  if (input.name != null) update.name = input.name;
  if (input.startTime != null) update.start_time = input.startTime;
  if (input.endTime != null) update.end_time = input.endTime;
  if (input.displayOrder != null) update.display_order = input.displayOrder;
  const { error } = await supabase.from('venue_slots').update(update).eq('id', slotId).eq('venue_id', venueId);
  return { error: error?.message };
}

export async function removeVenueSlot(slotId: string, venueId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueSlots(supabase, venueId))) return { error: 'Forbidden' };
  const { error } = await supabase.from('venue_slots').delete().eq('id', slotId).eq('venue_id', venueId);
  return { error: error?.message };
}

/** Returns availability per slot for a date (venue_slot_blocks + confirmed bookings). */
export async function getVenueSlotAvailability(
  venueId: string,
  dateStr: string
): Promise<{ slots?: { slotId: string; slotName: string; startTime: string; endTime: string; available: boolean }[]; error?: string }> {
  const supabase = await createClient();
  const { data: offered } = await supabase
    .from('venue_slots')
    .select('id, name, start_time, end_time')
    .eq('venue_id', venueId)
    .order('display_order', { ascending: true });
  const slotsData = (offered ?? []) as { id: string; name: string; start_time: string; end_time: string }[];
  const [blocksRes, bookingsRes] = await Promise.all([
    supabase
      .from('venue_slot_blocks')
      .select('venue_slot_id')
      .eq('venue_id', venueId)
      .eq('slot_date', dateStr),
    supabase
      .from('bookings')
      .select('venue_slot_id')
      .eq('venue_id', venueId)
      .eq('event_date', dateStr)
      .eq('booking_status', 'confirmed'),
  ]);
  const blockedSet = new Set((blocksRes.data ?? []).map((r) => r.venue_slot_id));
  const bookedSet = new Set(
    (bookingsRes.data ?? [])
      .filter((b) => b.venue_slot_id)
      .map((b) => b.venue_slot_id)
  );
  const slots = slotsData.map((s) => ({
    slotId: s.id,
    slotName: s.name,
    startTime: s.start_time,
    endTime: s.end_time,
    available: !blockedSet.has(s.id) && !bookedSet.has(s.id),
  }));
  return { slots };
}

export async function blockVenueSlot(
  venueId: string,
  slotDate: string,
  venueSlotId: string
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueSlots(supabase, venueId))) return { error: 'Forbidden' };
  const { data: row, error } = await supabase
    .from('venue_slot_blocks')
    .upsert({ venue_id: venueId, slot_date: slotDate, venue_slot_id: venueSlotId }, { onConflict: 'venue_id,slot_date,venue_slot_id' })
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: row.id };
}

export async function unblockVenueSlot(blockId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: block } = await supabase.from('venue_slot_blocks').select('venue_id').eq('id', blockId).single();
  if (!block) return { error: 'Not found' };
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', block.venue_id).single();
  if (!venue) return { error: 'Not found' };
  const admin = await isAdmin(supabase);
  if (!admin) {
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor || venue.vendor_id !== vendor.id) return { error: 'Forbidden' };
  }
  const { error } = await supabase.from('venue_slot_blocks').delete().eq('id', blockId);
  return { error: error?.message };
}

/** List slot blocks for a venue (e.g. for vendor dashboard). Optional date range. */
export async function getVenueSlotBlocks(
  venueId: string,
  fromDate?: string,
  toDate?: string
): Promise<{ blocks?: { id: string; slot_date: string; venue_slot_id: string; slot_name: string }[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return { error: 'Not found' };
  const admin = await isAdmin(supabase);
  if (!admin) {
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor || venue.vendor_id !== vendor.id) return { error: 'Forbidden' };
  }
  let query = supabase
    .from('venue_slot_blocks')
    .select('id, slot_date, venue_slot_id, venue_slots(name)')
    .eq('venue_id', venueId)
    .order('slot_date', { ascending: true });
  if (fromDate) query = query.gte('slot_date', fromDate);
  if (toDate) query = query.lte('slot_date', toDate);
  const { data, error } = await query;
  if (error) return { error: error.message };
  const blocks = (data ?? []).map((b: { id: string; slot_date: string; venue_slot_id: string; venue_slots: { name: string }[] | { name: string } | null }) => {
    const slot = Array.isArray(b.venue_slots) ? b.venue_slots[0] : b.venue_slots;
    return {
      id: b.id,
      slot_date: b.slot_date,
      venue_slot_id: b.venue_slot_id,
      slot_name: slot?.name ?? '',
    };
  });
  return { blocks };
}

export async function uploadVenueImage(formData: FormData): Promise<{ id?: string; url?: string; error?: string }> {
  const venueId = formData.get('venueId') as string;
  const file = formData.get('file') as File;
  if (!venueId || !file?.size) return { error: 'Missing venue or file' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return { error: 'Not found' };
  const admin = await isAdmin(supabase);
  if (!admin) {
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor || venue.vendor_id !== vendor.id) return { error: 'Forbidden' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${venueId}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('venue-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from('venue-images').getPublicUrl(path);
  const { data: images } = await supabase.from('venue_images').select('display_order').eq('venue_id', venueId).order('display_order', { ascending: false }).limit(1);
  const nextOrder = (images?.[0]?.display_order ?? -1) + 1;
  const { data: inserted, error: insertError } = await supabase.from('venue_images').insert({
    venue_id: venueId,
    image_url: urlData.publicUrl,
    display_order: nextOrder,
  }).select('id').single();
  if (insertError) return { error: insertError.message };
  return { id: inserted.id, url: urlData.publicUrl };
}

export async function reorderVenueImage(venueId: string, imageId: string, displayOrder: number): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return { error: 'Not found' };
  const admin = await isAdmin(supabase);
  if (!admin) {
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor || venue.vendor_id !== vendor.id) return { error: 'Forbidden' };
  }
  const { error } = await supabase.from('venue_images').update({ display_order: displayOrder }).eq('id', imageId);
  return { error: error?.message };
}

export async function deleteVenueImage(venueId: string, imageId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return { error: 'Not found' };
  const admin = await isAdmin(supabase);
  if (!admin) {
    const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
    if (!vendor || venue.vendor_id !== vendor.id) return { error: 'Forbidden' };
  }
  const { error } = await supabase.from('venue_images').delete().eq('id', imageId);
  return { error: error?.message };
}

async function canManageVenueVideos(supabase: Awaited<ReturnType<typeof createClient>>, venueId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', venueId).single();
  if (!venue) return false;
  const admin = await isAdmin(supabase);
  if (admin) return true;
  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  return !!vendor && venue.vendor_id === vendor.id;
}

export async function addVenueVideoUrl(venueId: string, videoUrl: string): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueVideos(supabase, venueId))) return { error: 'Forbidden' };
  const { data: rows } = await supabase.from('venue_videos').select('display_order').eq('venue_id', venueId).order('display_order', { ascending: false }).limit(1);
  const nextOrder = (rows?.[0]?.display_order ?? -1) + 1;
  const { data: row, error } = await supabase.from('venue_videos').insert({
    venue_id: venueId,
    video_url: videoUrl.trim(),
    display_order: nextOrder,
  }).select('id').single();
  if (error) return { error: error.message };
  return { id: row.id };
}

export async function uploadVenueVideo(formData: FormData): Promise<{ id?: string; url?: string; error?: string }> {
  const venueId = formData.get('venueId') as string;
  const file = formData.get('file') as File;
  if (!venueId || !file?.size) return { error: 'Missing venue or file' };

  const supabase = await createClient();
  if (!(await canManageVenueVideos(supabase, venueId))) return { error: 'Forbidden' };

  const ext = file.name.split('.').pop() ?? 'mp4';
  const path = `${venueId}/videos/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('venue-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from('venue-images').getPublicUrl(path);
  const result = await addVenueVideoUrl(venueId, urlData.publicUrl);
  if (result.error) return { error: result.error };
  return { id: result.id, url: urlData.publicUrl };
}

export async function deleteVenueVideo(videoId: string, venueId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await canManageVenueVideos(supabase, venueId))) return { error: 'Forbidden' };
  const { error } = await supabase.from('venue_videos').delete().eq('id', videoId).eq('venue_id', venueId);
  return { error: error?.message };
}

// ——— Admin-only venue actions ———

export async function createVenueAsAdmin(input: CreateVenueInput): Promise<{ id: string; error?: string }> {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { id: '', error: 'Forbidden' };

  const { data: vendor } = await supabase.from('vendors').select('id').eq('id', input.vendorId).single();
  if (!vendor) return { id: '', error: 'Vendor not found' };

  const { data: inserted, error } = await supabase
    .from('venues')
    .insert({
      vendor_id: input.vendorId,
      name: input.name,
      slug: 'temp',
      city: input.city,
      area: input.area || null,
      min_price: input.minPrice ?? null,
      max_price: input.maxPrice ?? null,
      capacity: input.capacity ?? null,
      venue_type: input.venueType,
      description: input.description || null,
      address: input.address || null,
      google_maps_link: input.googleMapsLink || null,
      catering_included: input.cateringIncluded ?? false,
      min_per_head_price: input.minPerHeadPrice ?? null,
      max_per_head_price: input.maxPerHeadPrice ?? null,
      per_head_with_catering_min: input.perHeadWithCateringMin ?? null,
      per_head_with_catering_max: input.perHeadWithCateringMax ?? null,
      per_head_without_catering_min: input.perHeadWithoutCateringMin ?? null,
      per_head_without_catering_max: input.perHeadWithoutCateringMax ?? null,
    })
    .select('id')
    .single();

  if (error) return { id: '', error: error.message };
  const slug = venueSlug(input.name, inserted.id);
  await supabase.from('venues').update({ slug }).eq('id', inserted.id);
  revalidatePath('/admin/venues');
  revalidatePath('/admin');
  return { id: inserted.id };
}

export interface UpdateVenueAsAdminInput extends UpdateVenueInput {
  vendorId?: string;
}

export async function updateVenueAsAdmin(input: UpdateVenueAsAdminInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: 'Forbidden' };

  const { data: venue } = await supabase.from('venues').select('id').eq('id', input.venueId).single();
  if (!venue) return { error: 'Not found' };

  const slug = venueSlug(input.name, input.venueId);
  const update: Record<string, unknown> = {
    name: input.name,
    slug,
    city: input.city,
    area: input.area || null,
    min_price: input.minPrice ?? null,
    max_price: input.maxPrice ?? null,
    capacity: input.capacity ?? null,
    venue_type: input.venueType,
    description: input.description || null,
    address: input.address || null,
    google_maps_link: input.googleMapsLink || null,
    catering_included: input.cateringIncluded ?? false,
    min_per_head_price: input.minPerHeadPrice ?? null,
    max_per_head_price: input.maxPerHeadPrice ?? null,
    per_head_with_catering_min: input.perHeadWithCateringMin ?? null,
    per_head_with_catering_max: input.perHeadWithCateringMax ?? null,
    per_head_without_catering_min: input.perHeadWithoutCateringMin ?? null,
    per_head_without_catering_max: input.perHeadWithoutCateringMax ?? null,
  };
  if (input.vendorId != null) update.vendor_id = input.vendorId;

  const { error } = await supabase.from('venues').update(update).eq('id', input.venueId);

  revalidatePath('/admin/venues');
  revalidatePath('/admin');
  return { error: error?.message };
}

export async function deleteVenueAsAdmin(venueId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await isAdmin(supabase))) return { error: 'Forbidden' };
  const { error } = await supabase.from('venues').delete().eq('id', venueId);
  revalidatePath('/admin/venues');
  revalidatePath('/admin');
  return { error: error?.message };
}
