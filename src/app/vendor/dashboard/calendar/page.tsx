import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';

const CalendarView = dynamic(
  () => import('./CalendarView').then((m) => ({ default: m.CalendarView })),
  {
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-10 w-full md:w-[160px] bg-section-alt rounded" />
          <div className="h-10 w-full md:w-[140px] bg-section-alt rounded" />
          <div className="h-10 w-full md:w-[160px] bg-section-alt rounded" />
        </div>
        <div className="rounded border border-border bg-section-alt p-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
            <div className="h-10 w-full md:w-[140px] bg-section-alt rounded" />
            <div className="h-10 w-full md:w-[160px] bg-section-alt rounded" />
            <div className="h-9 min-h-[44px] md:min-h-0 w-full md:w-24 bg-section-alt rounded" />
          </div>
          <div className="h-4 bg-muted rounded w-64" />
        </div>
        <div className="rounded border border-border overflow-hidden bg-card">
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1.5 md:py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-[60px] md:min-h-[80px] border-b border-r border-border bg-section-alt/50" aria-hidden />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

export default async function VendorCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  if (!vendor) return null;

  const { data: venues } = await supabase
    .from('venues')
    .select('id, name')
    .eq('vendor_id', vendor.id)
    .order('name');

  const venueIds = (venues ?? []).map((v) => v.id);

  let floors: { id: string; venue_id: string; name: string }[] = [];
  let slots: { id: string; venue_id: string; name: string; start_time?: string; end_time?: string }[] = [];
  let packages: { id: string; venue_id: string; name: string }[] = [];

  if (venueIds.length > 0) {
    const [floorsRes, slotsRes, packagesRes] = await Promise.all([
      supabase
        .from('venue_floors')
        .select('id, venue_id, name')
        .in('venue_id', venueIds)
        .order('display_order'),
      supabase
        .from('venue_slots')
        .select('id, venue_id, name, start_time, end_time')
        .in('venue_id', venueIds)
        .order('display_order'),
      supabase
        .from('venue_catering_packages')
        .select('id, venue_id, name')
        .in('venue_id', venueIds)
        .order('display_order'),
    ]);
    floors = floorsRes.data ?? [];
    slots = slotsRes.data ?? [];
    packages = packagesRes.data ?? [];
  }

  return (
    <div>
      <h2 className="text-h2 text-foreground font-normal mb-6">Calendar</h2>
      <CalendarView venues={venues ?? []} floors={floors} slots={slots} packages={packages} />
    </div>
  );
}
