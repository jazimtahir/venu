import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { NavigationEnd } from '@/components/layout/NavigationEnd';
import { MapPin, MessageCircle, Calendar, CalendarDays, TrendingUp } from 'lucide-react';

function whatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('92') ? digits : digits.startsWith('0') ? '92' + digits.slice(1) : '92' + digits;
  return `https://wa.me/${normalized}`;
}

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  if (!vendor) return null;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
  const next7Start = now.toISOString().slice(0, 10);
  const next7End = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: venueRows } = await supabase.from('venues').select('id').eq('vendor_id', vendor.id);
  const venueIds = venueRows?.map((v) => v.id) ?? [];

  const [
    { count: inquiriesThisMonth },
    { count: inquiriesLastMonth },
    { data: bookingsThisMonth },
    { data: upcomingBookings },
    { data: recentInquiries },
  ] = await Promise.all([
    venueIds.length > 0
      ? supabase
          .from('inquiries')
          .select('id', { count: 'exact', head: true })
          .in('venue_id', venueIds)
          .gte('created_at', `${thisMonthStart}T00:00:00`)
          .lte('created_at', `${thisMonthEnd}T23:59:59`)
      : { count: 0 },
    venueIds.length > 0
      ? supabase
          .from('inquiries')
          .select('id', { count: 'exact', head: true })
          .in('venue_id', venueIds)
          .gte('created_at', `${lastMonthStart}T00:00:00`)
          .lte('created_at', `${lastMonthEnd}T23:59:59`)
      : { count: 0 },
    supabase
      .from('bookings')
      .select('total_amount')
      .eq('vendor_id', vendor.id)
      .eq('booking_status', 'confirmed')
      .gte('event_date', thisMonthStart)
      .lte('event_date', thisMonthEnd),
    supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        event_type,
        event_date,
        venues ( name, slug ),
        venue_floors ( name )
      `)
      .eq('vendor_id', vendor.id)
      .in('booking_status', ['confirmed'])
      .gte('event_date', next7Start)
      .lte('event_date', next7End)
      .order('event_date', { ascending: true })
      .limit(5),
    venueIds.length > 0
      ? supabase
          .from('inquiries')
          .select(`
            id,
            name,
            phone,
            created_at,
            status,
            venues ( name, slug )
          `)
          .in('venue_id', venueIds)
          .order('created_at', { ascending: false })
          .limit(5)
      : { data: [] },
  ]);

  const inquiriesThisMonthCount = venueIds.length ? (inquiriesThisMonth ?? 0) : 0;
  const inquiriesLastMonthCount = venueIds.length ? (inquiriesLastMonth ?? 0) : 0;
  const deltaInquiries = inquiriesLastMonthCount > 0
    ? Math.round(((inquiriesThisMonthCount - inquiriesLastMonthCount) / inquiriesLastMonthCount) * 100)
    : 0;

  const confirmedThisMonth = (bookingsThisMonth ?? []).length;
  const revenueThisMonth = (bookingsThisMonth ?? []).reduce((sum, b) => sum + Number(b.total_amount ?? 0), 0);
  const upcomingList = (upcomingBookings ?? []).slice(0, 5);
  const recentInqList = recentInquiries ?? [];
  const venueTotalCount = venueIds.length;

  return (
    <div className="space-y-10">
      <NavigationEnd />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-border bg-section-alt p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-muted-foreground">Inquiries this month</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{inquiriesThisMonthCount}</p>
          {inquiriesLastMonthCount > 0 && (
            <p className={`mt-1 flex items-center gap-1 text-xs ${deltaInquiries >= 0 ? 'text-sage' : 'text-muted-foreground'}`}>
              <TrendingUp className="h-3.5 w-3.5" />
              {deltaInquiries >= 0 ? '+' : ''}{deltaInquiries}% vs last month
            </p>
          )}
        </div>
        <div className="rounded border border-border bg-section-alt p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-muted-foreground">Confirmed bookings this month</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{confirmedThisMonth}</p>
        </div>
        <div className="rounded border border-border bg-section-alt p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-muted-foreground">Upcoming in next 7 days</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{upcomingList.length}</p>
        </div>
        <div className="rounded border border-border bg-section-alt p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-muted-foreground">Est. revenue this month</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            Rs {revenueThisMonth.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/vendor/dashboard/bookings/new" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Add booking
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/vendor/dashboard/calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            View calendar
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/vendor/dashboard/inquiries" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            View all inquiries
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="text-h3 text-foreground font-normal mb-4">Upcoming events</h2>
        {upcomingList.length > 0 ? (
          <ul className="space-y-2">
            {upcomingList.map((b) => {
              const v = (b as { venues?: { name: string; slug: string } | { name: string; slug: string }[] | null }).venues;
              const f = (b as { venue_floors?: { name: string } | { name: string }[] | null }).venue_floors;
              const venueName = v && !Array.isArray(v) ? v.name : Array.isArray(v) ? v[0]?.name : null;
              const floorName = f && !Array.isArray(f) ? f.name : Array.isArray(f) ? f[0]?.name : null;
              return (
                <li key={(b as { id: string }).id} className="flex flex-col gap-2 rounded border border-border bg-section-alt px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                  <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-0 sm:contents">
                    <span className="font-medium text-foreground">{(b as { client_name: string }).client_name}</span>
                    <span className="block text-sm text-muted-foreground sm:inline">
                      {String((b as { event_type: string }).event_type ?? 'other').charAt(0).toUpperCase() + String((b as { event_type: string }).event_type ?? 'other').slice(1)}
                      {' · '}
                      {new Date((b as { event_date: string }).event_date).toLocaleDateString()}
                    </span>
                    {venueName && <span className="block text-sm text-muted-foreground sm:inline">{venueName}</span>}
                    {floorName && <span className="block text-xs text-muted-foreground sm:inline">({floorName})</span>}
                  </div>
                  <Button variant="ghost" size="sm" asChild className="w-full min-h-[44px] sm:w-auto sm:min-h-0">
                    <Link href={`/vendor/dashboard/bookings?highlight=${(b as { id: string }).id}`}>View</Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No upcoming events in the next 7 days.</p>
        )}
      </section>

      <section>
        <h2 className="text-h3 text-foreground font-normal mb-4">Recent inquiries</h2>
        {recentInqList.length > 0 ? (
          <ul className="space-y-2">
            {recentInqList.map((inq) => {
              const v = (inq as { venues?: { name: string; slug: string } | { name: string; slug: string }[] | null }).venues;
              const venueName = v && !Array.isArray(v) ? v.name : Array.isArray(v) ? v[0]?.name : null;
              return (
                <li key={(inq as { id: string }).id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded border border-border bg-section-alt px-4 py-3">
                  <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium text-foreground">{(inq as { name: string }).name}</span>
                    {venueName && <span className="text-sm text-muted-foreground">{venueName}</span>}
                    <span className="text-xs text-muted-foreground">
                      {new Date((inq as { created_at: string }).created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 border-t border-border pt-2 sm:border-t-0 sm:pt-0 sm:pl-3 sm:border-l">
                    <a
                      href={whatsAppLink((inq as { phone: string }).phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95 min-h-[44px]"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/vendor/dashboard/inquiries">Open</Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No recent inquiries.</p>
        )}
      </section>

      <section>
        <h2 className="text-h3 text-foreground font-normal mb-4">Your venues</h2>
        {venueTotalCount > 0 ? (
          <div className="rounded border border-border bg-section-alt p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">
              {venueTotalCount === 1 ? 'You have 1 venue.' : `You have ${venueTotalCount} venues.`}
            </p>
            <Button variant="outline" size="sm" asChild className="mt-3">
              <Link href="/vendor/dashboard/venues">View all venues</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded border border-dashed border-border bg-section-alt py-8 text-center">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground" strokeWidth={1.5} aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">You haven&apos;t added any venues yet.</p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/vendor/dashboard/venues/new">Add your first venue</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
