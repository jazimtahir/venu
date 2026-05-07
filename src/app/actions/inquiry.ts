'use server';

import { headers } from 'next/headers';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createNotification, sendVendorEmail } from '@/lib/notifications';

const RATE_LIMIT_MINUTES = 5;

interface SubmitInquiryInput {
  venueId: string;
  name: string;
  phone: string;
  eventDate: string | null;
  message: string | null;
  preferredSlot: null;
  preferredSlotId: string | null;
  interestedPackageId: string | null;
  floorId: string | null;
  eventType: string | null;
  /** Honeypot: if non-empty, reject (bot trap) */
  honeypot?: string;
}

async function getRateLimitKey(): Promise<string | null> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() ?? realIp ?? null;
    if (!ip) return null;
    return crypto.createHash('sha256').update(ip).digest('hex');
  } catch {
    return null;
  }
}

export async function submitInquiry(input: SubmitInquiryInput): Promise<{ success: boolean; error?: string }> {
  if (input.honeypot?.trim()) {
    return { success: true };
  }

  const supabase = await createClient();
  const key = await getRateLimitKey();
  if (key) {
    const { data: existing } = await supabase
      .from('inquiry_rate_limit')
      .select('last_submitted_at')
      .eq('key', key)
      .single();
    const windowStart = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
    if (existing && new Date(existing.last_submitted_at) > windowStart) {
      return { success: false, error: 'Please wait a few minutes before submitting another inquiry.' };
    }
    await supabase.from('inquiry_rate_limit').upsert(
      { key, last_submitted_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Use RPC (SECURITY DEFINER) so insert succeeds without relying on INSERT RLS policy
  const { data: inquiryId, error } = await supabase.rpc('submit_public_inquiry', {
    p_venue_id: input.venueId,
    p_user_id: user?.id ?? null,
    p_name: input.name.trim(),
    p_phone: input.phone.trim(),
    p_event_date: input.eventDate || null,
    p_message: input.message?.trim() || null,
    p_preferred_slot_id: input.preferredSlotId || null,
    p_interested_package_id: input.interestedPackageId || null,
    p_floor_id: input.floorId || null,
    p_event_type: input.eventType || null,
  });
  if (error) return { success: false, error: error.message };
  await sendInquiryNotification(input);
  const { data: venue } = await supabase.from('venues').select('vendor_id').eq('id', input.venueId).single();
  if (venue && inquiryId) {
    await createNotification(
      venue.vendor_id,
      'new_inquiry',
      'New inquiry',
      `${input.name} – ${input.eventDate ?? 'No date'} – ${input.message?.slice(0, 80) ?? ''}`,
      inquiryId
    );
    await sendVendorEmail(
      venue.vendor_id,
      'New inquiry for your venue',
      `You received a new inquiry.\nName: ${input.name}\nPhone: ${input.phone}\nEvent date: ${input.eventDate ?? 'Not set'}\nMessage: ${input.message ?? ''}`
    );
  }
  return { success: true };
}

async function sendInquiryNotification(input: SubmitInquiryInput) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  if (!adminEmail || !resendKey) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Venue <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `New inquiry for venue`,
        text: `Name: ${input.name}\nPhone: ${input.phone}\nEvent date: ${input.eventDate ?? 'Not set'}\nMessage: ${input.message ?? ''}`,
      }),
    });
    if (!res.ok) console.error('Resend error', await res.text());
  } catch (e) {
    console.error('Email send failed', e);
  }
}
