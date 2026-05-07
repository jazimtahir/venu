'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function getVendorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  return vendor?.id ?? null;
}

export async function getVendorUnreadCount() {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return 0;
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('vendor_id', vendorId)
    .eq('is_read', false);
  return count ?? 0;
}

export async function getVendorNotifications(limit: number = 10) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { data: [], error: 'Unauthorized' };
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, is_read, related_id, created_at')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const vendorId = await getVendorId(supabase);
  if (!vendorId) return { error: 'Unauthorized' };
  const { data: row } = await supabase
    .from('notifications')
    .select('vendor_id')
    .eq('id', notificationId)
    .single();
  if (!row || row.vendor_id !== vendorId) return { error: 'Forbidden' };
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) return { error: error.message };
  revalidatePath('/vendor/dashboard');
  return {};
}
