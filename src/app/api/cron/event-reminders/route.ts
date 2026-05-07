import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/notifications';
import { NextResponse } from 'next/server';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 503 });
  }
  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const dateStr = inThreeDays.toISOString().slice(0, 10);

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      vendor_id,
      client_name,
      client_phone,
      client_email,
      event_date,
      event_type,
      venues ( name )
    `)
    .eq('booking_status', 'confirmed')
    .eq('event_date', dateStr);

  const list = bookings ?? [];

  if (list.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const vendorIds = [...new Set(list.map((b) => b.vendor_id))];
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, notification_email')
    .in('id', vendorIds);
  const vendorEmailById = new Map(
    (vendors ?? [])
      .filter((row) => row.notification_email?.trim())
      .map((row) => [row.id, row.notification_email!.trim()] as const)
  );

  const notificationRows = list.map((b) => {
    const v = b.venues as { name: string } | { name: string }[] | null;
    const venueName = (Array.isArray(v) ? v[0] : v)?.name ?? 'Venue';
    return {
      vendor_id: b.vendor_id,
      type: 'event_reminder',
      title: 'Event in 3 days',
      body: `${b.client_name} – ${b.event_date} – ${venueName}`,
      related_id: b.id,
    };
  });
  await supabase.from('notifications').insert(notificationRows);

  for (const b of list) {
    const v = b.venues as { name: string } | { name: string }[] | null;
    const venueName = (Array.isArray(v) ? v[0] : v)?.name ?? 'Venue';
    const vendorEmail = vendorEmailById.get(b.vendor_id);
    if (vendorEmail) {
      await sendEmail(
        vendorEmail,
        'Event reminder: 3 days to go',
        `Reminder: You have an event in 3 days.\nClient: ${b.client_name}\nEvent date: ${b.event_date}\nVenue: ${venueName}`
      );
    }
    const clientEmail = (b as { client_email: string | null }).client_email?.trim();
    if (clientEmail) {
      await sendEmail(
        clientEmail,
        'Event reminder – 3 days to go',
        `Reminder: Your event is in 3 days.\n\nEvent date: ${b.event_date}\nVenue: ${venueName}`
      );
    }
  }
  return NextResponse.json({ ok: true, sent: list.length });
}
