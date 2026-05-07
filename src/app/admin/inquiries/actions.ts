'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function deleteInquiryAction(formData: FormData) {
  const inquiryId = formData.get('inquiryId') as string;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return;
  await supabase.from('inquiries').delete().eq('id', inquiryId);
  revalidatePath('/admin/inquiries');
  revalidatePath('/admin');
}
