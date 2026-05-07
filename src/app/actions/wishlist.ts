'use server';

import { createClient } from '@/lib/supabase/server';

export async function getWishlistVenueIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('venue_wishlists')
    .select('venue_id')
    .eq('user_id', user.id);
  return (data ?? []).map((r) => r.venue_id);
}

export async function addToWishlist(venueId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in to save venues' };
  const { error } = await supabase
    .from('venue_wishlists')
    .insert({ user_id: user.id, venue_id: venueId });
  if (error) {
    if (error.code === '23505') return {}; // already in wishlist
    return { error: error.message };
  }
  return {};
}

export async function removeFromWishlist(venueId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in to manage saved venues' };
  const { error } = await supabase
    .from('venue_wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('venue_id', venueId);
  if (error) return { error: error.message };
  return {};
}
