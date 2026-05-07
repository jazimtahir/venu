import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { getVendorBookings } from '@/app/actions/bookings';
import type { BookingStatus } from '@/types/database';
import type { InquiryEventType } from '@/types/database';

const BookingsListWithDrawer = dynamic(
  () => import('./BookingsListWithDrawer').then((m) => ({ default: m.BookingsListWithDrawer })),
  {
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="hidden md:flex flex-wrap items-center gap-3">
          <div className="h-4 bg-muted rounded w-14" />
          <div className="h-10 bg-section-alt rounded w-[130px]" />
          <div className="h-10 bg-section-alt rounded w-[180px]" />
          <div className="h-10 bg-section-alt rounded w-[140px]" />
          <div className="h-10 bg-section-alt rounded w-[140px]" />
        </div>
        <div className="md:hidden w-full">
          <div className="w-full min-h-[44px] rounded border border-border bg-section-alt" aria-hidden />
        </div>
        <ul className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="flex flex-col gap-2 rounded border border-border bg-section-alt p-4 md:flex-row md:flex-wrap md:items-center md:gap-3">
              <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
                <div className="h-4 bg-muted rounded w-28" />
                <div className="h-4 bg-muted rounded w-24" />
              </div>
              <div className="h-4 bg-muted rounded w-20" />
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-5 bg-muted rounded w-16" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    ),
  }
);
interface PageProps {
  searchParams: Promise<{
    status?: string;
    venue_id?: string;
    from_date?: string;
    to_date?: string;
    event_type?: string;
  }>;
}

export default async function VendorBookingsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  if (!vendor) return null;

  const params = await searchParams;
  const filters: Parameters<typeof getVendorBookings>[0] = {};
  if (params.status && ['confirmed', 'completed', 'cancelled'].includes(params.status)) {
    filters.status = params.status as BookingStatus;
  }
  if (params.venue_id) filters.venue_id = params.venue_id;
  if (params.from_date) filters.from_date = params.from_date;
  if (params.to_date) filters.to_date = params.to_date;
  if (params.event_type && ['mehndi', 'walima', 'baraat', 'nikah', 'engagement', 'other'].includes(params.event_type)) {
    filters.event_type = params.event_type as InquiryEventType;
  }

  const { data: bookings } = await getVendorBookings(filters);
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name')
    .eq('vendor_id', vendor.id)
    .order('name');

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-h2 text-foreground font-normal">Bookings</h2>
        <Link
          href="/vendor/dashboard/bookings/new"
          className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-medium text-[var(--page-bg)] shadow-[var(--shadow-soft)] hover:bg-brand-hover transition-all duration-200 sm:w-auto"
        >
          Add booking
        </Link>
      </div>
      <BookingsListWithDrawer
        bookings={(bookings ?? []).map((b) => {
          const v = b.venues as { name: string; slug: string } | { name: string; slug: string }[] | null;
          const venue = Array.isArray(v) ? v[0] ?? null : v;
          return {
            id: b.id,
            venue_id: b.venue_id,
            client_name: b.client_name,
            client_phone: b.client_phone,
            event_type: b.event_type,
            event_date: b.event_date,
            total_amount: b.total_amount,
            advance_paid: b.advance_paid,
            booking_status: b.booking_status,
            venues: venue,
          };
        })}
        venues={venues ?? []}
      />
    </div>
  );
}
