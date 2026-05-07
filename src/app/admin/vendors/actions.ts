'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function verifyVendorAction(formData: FormData) {
  const vendorId = formData.get('vendorId') as string;
  const verified = formData.get('verified') === 'true';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return;
  await supabase.from('vendors').update({ is_verified: verified }).eq('id', vendorId);
  revalidatePath('/admin/vendors');
  revalidatePath('/admin');
}
