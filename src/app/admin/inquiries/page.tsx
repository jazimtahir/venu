import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { deleteInquiryAction } from './actions';
import { User, Phone, Calendar, MessageSquare, Trash2 } from 'lucide-react';

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select(`
      id,
      name,
      phone,
      event_date,
      message,
      created_at,
      venue_id,
      interested_package_id,
      floor_id,
      event_type,
      venues ( name, slug ),
      venue_catering_packages ( id, name, per_head_price ),
      venue_floors ( id, name, capacity )
    `)
    .order('created_at', { ascending: false });

  const list = inquiries ?? [];

  return (
    <div>
      <h2 className="text-h2 text-foreground font-normal mb-6">Inquiries</h2>
      {list.length > 0 ? (
        <ul className="space-y-4">
          {list.map((inq) => {
            const venue = Array.isArray(inq.venues) ? inq.venues[0] : inq.venues;
            return (
              <li
                key={inq.id}
                className="flex flex-col gap-4 rounded border border-border bg-section-alt p-5 shadow-[var(--shadow-soft)] transition-all duration-200 hover:shadow-[var(--shadow-card)] sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
              >
                <div className="space-y-3 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                      {inq.name}
                    </span>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {inq.phone}
                    </span>
                  </div>
                  {venue && (
                    <Link
                      href={`/venue/${venue.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline underline-offset-2"
                    >
                      {venue.name}
                      <span>→</span>
                    </Link>
                  )}
                  {inq.event_date && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Event: {new Date(inq.event_date).toLocaleDateString()}
                    </p>
                  )}
                  {inq.message && (
                    <p className="flex gap-2 text-sm text-foreground">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
                      {inq.message}
                    </p>
                  )}
                  {inq.interested_package_id && (() => {
                    const pkg = inq.venue_catering_packages as { name?: string; per_head_price?: number } | { name?: string; per_head_price?: number }[] | null;
                    const p = Array.isArray(pkg) ? pkg[0] : pkg;
                    return p?.name ? (
                      <p className="text-sm text-muted-foreground">Interested package: {p.name}{p.per_head_price != null ? ` (Rs ${p.per_head_price.toLocaleString()}/head)` : ''}</p>
                    ) : null;
                  })()}
                  {inq.floor_id && (() => {
                    const fl = inq.venue_floors as { name?: string } | { name?: string }[] | null;
                    const f = Array.isArray(fl) ? fl[0] : fl;
                    return f?.name ? <p className="text-sm text-muted-foreground">Preferred floor: {f.name}</p> : null;
                  })()}
                  {inq.event_type && (
                    <p className="text-sm text-muted-foreground">Event type: {String(inq.event_type).charAt(0).toUpperCase() + String(inq.event_type).slice(1)}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{new Date(inq.created_at).toLocaleString()}</p>
                </div>
                <form action={deleteInquiryAction} className="w-full sm:w-auto">
                  <input type="hidden" name="inquiryId" value={inq.id} />
                  <button
                    type="submit"
                    className="inline-flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors sm:w-auto sm:min-h-0 sm:py-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded border border-dashed border-border bg-section-alt py-16 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 text-muted-foreground">No inquiries yet.</p>
        </div>
      )}
    </div>
  );
}
