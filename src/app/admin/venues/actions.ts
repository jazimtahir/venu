'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { deleteVenueAsAdmin } from '@/app/actions/venue';

export async function setFeaturedAction(formData: FormData) {
  const venueId = formData.get('venueId') as string;
  const featured = formData.get('featured') === 'true';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return;
  await supabase.from('venues').update({ is_featured: featured }).eq('id', venueId);
  revalidatePath('/admin/venues');
  revalidatePath('/admin');
}

export async function setVerifiedAction(formData: FormData) {
  const venueId = formData.get('venueId') as string;
  const verified = formData.get('verified') === 'true';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return;
  await supabase.from('venues').update({ is_verified: verified }).eq('id', venueId);
  revalidatePath('/admin/venues');
  revalidatePath('/admin');
}

export async function deleteVenueAction(formData: FormData) {
  const venueId = formData.get('venueId') as string;
  await deleteVenueAsAdmin(venueId);
}
