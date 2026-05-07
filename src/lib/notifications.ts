'use server';

import { createClient } from '@/lib/supabase/server';

export type NotificationType = 'new_inquiry' | 'booking_confirmed' | 'event_reminder';

export async function createNotification(
  vendorId: string,
  type: NotificationType,
  title: string,
  body: string | null,
  relatedId: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase.from('notifications').insert({
    vendor_id: vendorId,
    type,
    title,
    body,
    related_id: relatedId,
  });
  if (error) console.error('Notification insert failed', error);
}

export async function getVendorEmail(vendorId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: vendor } = await supabase
    .from('vendors')
    .select('notification_email, user_id')
    .eq('id', vendorId)
    .single();
  if (vendor?.notification_email) return vendor.notification_email;
  return null;
}

export async function sendVendorEmail(vendorId: string, subject: string, text: string): Promise<boolean> {
  const to = await getVendorEmail(vendorId);
  if (!to) return false;
  return sendEmail(to, subject, text);
}

export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Venue <onboarding@resend.dev>',
        to: [to],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error('Resend email error', await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('Email send failed', e);
    return false;
  }
}
