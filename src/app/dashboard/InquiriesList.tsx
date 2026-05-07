import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { InquiryStatus } from '@/types/database';

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  negotiating: 'Negotiating',
  confirmed: 'Confirmed',
  lost: 'Closed',
};

export async function InquiriesList({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select(`
      id,
      name,
      phone,
      event_date,
      message,
      status,
      created_at,
      venue_id,
      venues ( name, slug )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!inquiries?.length) {
    return (
      <p className="rounded border border-border bg-section-alt p-6 text-center text-muted-foreground text-sm shadow-[var(--shadow-soft)]">
        You haven&apos;t sent any inquiries yet. Browse <Link href="/venues" className="font-medium text-brand hover:underline underline-offset-2">venues</Link> and send an inquiry from a venue page.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {inquiries.map((inq) => {
        const venue = Array.isArray(inq.venues) ? inq.venues[0] : inq.venues;
        const status = (inq.status ?? 'new') as InquiryStatus;
        return (
          <li
            key={inq.id}
            className="rounded border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-colors duration-200 hover:bg-section-alt/80"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{inq.name}</p>
                <p className="text-sm text-muted-foreground">{inq.phone}</p>
                {venue && (
                  <Link href={`/venue/${venue.slug}`} className="text-sm text-brand hover:underline underline-offset-2">
                    {venue.name}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground"
                  title="Venue response status"
                >
                  {STATUS_LABELS[status]}
                </span>
                <time className="text-xs text-muted-foreground">{new Date(inq.created_at).toLocaleDateString()}</time>
              </div>
            </div>
            {inq.event_date && (
              <p className="mt-1 text-sm text-muted-foreground">Event date: {new Date(inq.event_date).toLocaleDateString()}</p>
            )}
            {inq.message && <p className="mt-2 text-sm text-foreground">{inq.message}</p>}
          </li>
        );
      })}
    </ul>
  );
}
