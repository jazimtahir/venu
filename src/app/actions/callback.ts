'use server';

import { createClient } from '@/lib/supabase/server';

interface SubmitCallbackLeadInput {
  phone: string;
  city: string;
  eventDate: string | null;
}

export async function submitCallbackLead(
  input: SubmitCallbackLeadInput
): Promise<{ success: boolean; error?: string }> {
  const phone = input.phone?.trim();
  const city = input.city?.trim();
  if (!phone || !city) return { success: false, error: 'Phone and city are required.' };
  const supabase = await createClient();
  const { error } = await supabase.from('callback_leads').insert({
    phone,
    city,
    event_date: input.eventDate || null,
  });
  if (error) return { success: false, error: error.message };
  await sendCallbackNotification(input);
  return { success: true };
}

async function sendCallbackNotification(input: SubmitCallbackLeadInput) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  if (!adminEmail || !resendKey) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Venue <onboarding@resend.dev>',
        to: [adminEmail],
        subject: 'New callback request – Help me find a venue',
        text: `Phone: ${input.phone}\nCity: ${input.city}\nEvent date: ${input.eventDate ?? 'Not set'}`,
      }),
    });
  } catch (e) {
    console.error('Callback email send failed', e);
  }
}
