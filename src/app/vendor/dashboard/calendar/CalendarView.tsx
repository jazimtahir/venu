'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, X, Loader2, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getVendorBookingsForCalendar,
  getBlockedDates,
  getVendorBookingById,
  createBlockedDate,
  deleteBlockedDate,
} from '@/app/actions/bookings';
import { formatTime12h } from '@/lib/utils';
import { getCached, setCached } from '@/lib/client-cache';
import { toast } from 'sonner';

const CALENDAR_CACHE_TTL_MS = 120_000; // 2 min – same month when navigating back uses cache

const EVENT_TYPE_COLORS: Record<string, string> = {
  mehndi: 'bg-champagne/90 text-ink',
  baraat: 'bg-brand/90 text-[var(--page-bg)]',
  walima: 'bg-sage/90 text-ink',
  nikah: 'bg-blue-500/90 text-white',
  engagement: 'bg-blush text-ink',
  other: 'bg-muted/80 text-muted-foreground',
};

function eventTypeColor(t: string | null | undefined): string {
  return (t && EVENT_TYPE_COLORS[t]) || EVENT_TYPE_COLORS.other;
}

interface CalendarViewProps {
  venues: { id: string; name: string }[];
  floors: { id: string; venue_id: string; name: string }[];
  slots: { id: string; venue_id: string; name: string; start_time?: string; end_time?: string }[];
  packages: { id: string; venue_id: string; name: string }[];
}

const ALL_VENUES_VALUE = 'all';

export function CalendarView({ venues, floors, slots, packages }: CalendarViewProps) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [venueFilter, setVenueFilter] = useState<string>(ALL_VENUES_VALUE);
  const [floorFilter, setFloorFilter] = useState<string | null>(null);
  const [slotFilter, setSlotFilter] = useState<string | null>(null);
  const [packageFilter, setPackageFilter] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Awaited<ReturnType<typeof getVendorBookingsForCalendar>>['data']>([]);
  const [blocked, setBlocked] = useState<Awaited<ReturnType<typeof getBlockedDates>>['data']>([]);
  const [loading, setLoading] = useState(true);
  const [drawerBookingId, setDrawerBookingId] = useState<string | null>(null);
  const [drawerDetail, setDrawerDetail] = useState<Awaited<ReturnType<typeof getVendorBookingById>>['data']>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockVenueId, setBlockVenueId] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fromStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const toStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const venueIdForApi = venueFilter && venueFilter !== ALL_VENUES_VALUE ? venueFilter : undefined;

  const loadMonth = useCallback(async () => {
    const cacheKey = `calendar-${year}-${month}-${venueIdForApi ?? 'all'}-${floorFilter ?? ''}-${slotFilter ?? ''}-${packageFilter ?? ''}`;
    const cached = getCached<{ bookings: typeof bookings; blocked: typeof blocked }>(cacheKey);
    if (cached) {
      setBookings(cached.bookings);
      setBlocked(cached.blocked);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [bRes, blockRes] = await Promise.all([
      getVendorBookingsForCalendar(
        year,
        month,
        venueIdForApi,
        floorFilter || undefined,
        slotFilter || undefined,
        packageFilter || undefined
      ),
      getBlockedDates(venueIdForApi ?? null, fromStr, toStr),
    ]);
    const bData = bRes.data;
    const blockData = blockRes.data;
    setBookings(bData);
    setBlocked(blockData);
    setCached(cacheKey, { bookings: bData, blocked: blockData }, CALENDAR_CACHE_TTL_MS);
    setLoading(false);
  }, [year, month, venueIdForApi, floorFilter, slotFilter, packageFilter, fromStr, toStr]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const openDrawer = useCallback((bookingId: string) => {
    setDrawerBookingId(bookingId);
    setDrawerLoading(true);
    setDrawerDetail(null);
    getVendorBookingById(bookingId).then((res) => {
      setDrawerDetail(res.data);
      setDrawerLoading(false);
    });
  }, []);

  const daysInMonth = lastDay;
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  type CalendarBooking = (typeof bookings)[number];
  const bookingsByDate = new Map<string, CalendarBooking[]>();
  for (const b of bookings) {
    const d = (b as { event_date: string }).event_date;
    if (!bookingsByDate.has(d)) bookingsByDate.set(d, []);
    bookingsByDate.get(d)!.push(b as CalendarBooking);
  }
  const blockedByDate = new Map<string, { id: string; venue_id: string; date: string; reason: string | null }[]>();
  for (const x of blocked ?? []) {
    if (!blockedByDate.has(x.date)) blockedByDate.set(x.date, []);
    blockedByDate.get(x.date)!.push(x);
  }

  const floorsForVenue = venueIdForApi ? floors.filter((f) => f.venue_id === venueIdForApi) : floors;
  const slotsForVenue = venueIdForApi ? slots.filter((s) => s.venue_id === venueIdForApi) : slots;
  const packagesForVenue = venueIdForApi ? packages.filter((p) => p.venue_id === venueIdForApi) : packages;
  const showVenueNameOnBookings = !venueIdForApi;

  const handleBlockDate = async () => {
    if (!blockDate || !blockVenueId) return;
    setBlocking(true);
    const res = await createBlockedDate(blockVenueId, blockDate);
    setBlocking(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Date blocked');
      setBlockDate('');
      setBlockVenueId('');
      loadMonth();
    }
  };
  const handleUnblock = async (blockId: string) => {
    const res = await deleteBlockedDate(blockId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Block removed');
      loadMonth();
    }
  };

  const calendarFilterCount = [
    venueFilter && venueFilter !== ALL_VENUES_VALUE,
    floorFilter,
    slotFilter,
    packageFilter,
  ].filter(Boolean).length;

  const calendarFilterControls = (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Venue</span>
        <Select
          value={venueFilter || 'all'}
          onValueChange={(v) => {
            setVenueFilter(v === 'all' ? ALL_VENUES_VALUE : v);
            setFloorFilter(null);
            setSlotFilter(null);
            setPackageFilter(null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All venues" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All venues</SelectItem>
            {venues.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {floorsForVenue.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">Floor</span>
          <Select
            value={floorFilter || 'all'}
            onValueChange={(v) => setFloorFilter(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All floors</SelectItem>
              {floorsForVenue.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {slotsForVenue.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">Slot</span>
          <Select
            value={slotFilter || 'all'}
            onValueChange={(v) => setSlotFilter(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All slots" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All slots</SelectItem>
              {slotsForVenue.map((s) => {
                const timeStr =
                  s.start_time && s.end_time
                    ? `${formatTime12h(s.start_time)} – ${formatTime12h(s.end_time)}`
                    : null;
                const label = timeStr ? `${s.name} (${timeStr})` : s.name;
                return (
                  <SelectItem key={s.id} value={s.id}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      {packagesForVenue.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">Package</span>
          <Select
            value={packageFilter || 'all'}
            onValueChange={(v) => setPackageFilter(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All packages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packages</SelectItem>
              {packagesForVenue.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex w-full min-w-0 items-center">
          <Button
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px] shrink-0"
            onClick={() => {
              if (month === 1) {
                setMonth(12);
                setYear((y) => y - 1);
              } else setMonth((m) => m - 1);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-0 flex-1 text-center font-medium text-foreground">
            {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px] shrink-0"
            onClick={() => {
              if (month === 12) {
                setMonth(1);
                setYear((y) => y + 1);
              } else setMonth((m) => m + 1);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* Desktop: inline filters */}
        <div className="hidden md:flex flex-wrap items-center gap-2">
          <Select
            value={venueFilter || 'all'}
            onValueChange={(v) => {
              setVenueFilter(v === 'all' ? ALL_VENUES_VALUE : v);
              setFloorFilter(null);
              setSlotFilter(null);
              setPackageFilter(null);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All venues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All venues</SelectItem>
              {venues.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {floorsForVenue.length > 0 && (
            <Select
              value={floorFilter || 'all'}
              onValueChange={(v) => setFloorFilter(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All floors</SelectItem>
                {floorsForVenue.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {slotsForVenue.length > 0 && (
            <Select
              value={slotFilter || 'all'}
              onValueChange={(v) => setSlotFilter(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All slots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All slots</SelectItem>
                {slotsForVenue.map((s) => {
                  const timeStr =
                    s.start_time && s.end_time
                      ? `${formatTime12h(s.start_time)} – ${formatTime12h(s.end_time)}`
                      : null;
                  const label = timeStr ? `${s.name} (${timeStr})` : s.name;
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          {packagesForVenue.length > 0 && (
            <Select
              value={packageFilter || 'all'}
              onValueChange={(v) => setPackageFilter(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All packages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All packages</SelectItem>
                {packagesForVenue.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {/* Mobile: Filters button + Sheet */}
        <div className="w-full md:hidden">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="w-full min-h-[44px] gap-2 border-border"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Venue & filters{calendarFilterCount > 0 ? ` (${calendarFilterCount})` : ''}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] flex flex-col p-0 rounded-t-2xl"
            >
              <SheetHeader className="p-4 border-b border-border shrink-0">
                <SheetTitle className="text-left">Filters</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto flex-1 p-4">
                {calendarFilterControls}
              </div>
              <div className="p-4 border-t border-border shrink-0">
                <Button
                  className="w-full min-h-[44px]"
                  onClick={() => setFiltersOpen(false)}
                >
                  Show results
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="rounded border border-border bg-section-alt p-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:gap-3">
        <Label className="sr-only">Block a date</Label>
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
          <DatePicker
            value={blockDate}
            onChange={setBlockDate}
            min={new Date().toISOString().slice(0, 10)}
            placeholder="Pick date"
            className="w-full md:w-[140px]"
          />
          <Select value={blockVenueId || ''} onValueChange={setBlockVenueId}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="w-full md:w-auto min-h-[44px] md:min-h-0" onClick={handleBlockDate} disabled={!blockDate || !blockVenueId || blocking}>
            {blocking ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Block date
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">Block a date for a venue so it shows as unavailable.</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded border border-border overflow-hidden bg-card">
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1.5 md:py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`pad-${i}`} className="min-h-[60px] md:min-h-[80px] border-b border-r border-border bg-section-alt/50" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayBookings = bookingsByDate.get(dateStr) ?? [];
              const dayBlocked = blockedByDate.get(dateStr) ?? [];
              const isPast = new Date(dateStr) < new Date(new Date().toISOString().slice(0, 10));
              return (
                <div
                  key={dateStr}
                  className={`min-h-[60px] md:min-h-[80px] border-b border-r border-border p-1 ${
                    isPast ? 'bg-section-alt/50' : 'bg-card'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs md:text-sm font-medium text-foreground">{day}</span>
                    {!isPast && (
                      <Link
                        href={`/vendor/dashboard/bookings/new?date=${dateStr}`}
                        className="flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded opacity-0 hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-brand -m-1"
                        title="Add booking"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayBlocked.map((bl) => (
                      <div
                        key={bl.id}
                        className="group flex items-center justify-between rounded bg-muted/80 text-muted-foreground text-[10px] px-1 py-0.5"
                      >
                        <span>Blocked</span>
                        <button
                          type="button"
                          onClick={(e) => (e.stopPropagation(), handleUnblock(bl.id))}
                          className="opacity-0 group-hover:opacity-100 text-destructive hover:underline"
                          title="Unblock"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {dayBookings.map((b) => {
                      const booking = b as {
                        id: string;
                        client_name: string;
                        event_type: string;
                        venues?: { name: string } | { name: string }[] | null;
                        venue_slots?: { name: string; start_time?: string; end_time?: string } | { name: string; start_time?: string; end_time?: string }[] | null;
                        venue_catering_packages?: { name: string } | { name: string }[] | null;
                      };
                      const venueName = booking.venues
                        ? Array.isArray(booking.venues)
                          ? booking.venues[0]?.name
                          : booking.venues.name
                        : null;
                      const slotRaw = booking.venue_slots;
                      const slot = Array.isArray(slotRaw) ? slotRaw[0] ?? null : slotRaw ?? null;
                      const slotTimeStr =
                        slot?.start_time && slot?.end_time
                          ? `${formatTime12h(slot.start_time)}–${formatTime12h(slot.end_time)}`
                          : null;
                      const pkgRaw = booking.venue_catering_packages;
                      const packageName = (Array.isArray(pkgRaw) ? pkgRaw[0] : pkgRaw)?.name ?? null;
                      const subtitle = slotTimeStr ?? packageName;
                      const titleParts = [booking.client_name];
                      if (showVenueNameOnBookings && venueName) titleParts.push(venueName);
                      if (subtitle) titleParts.push(subtitle);
                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => openDrawer(booking.id)}
                          className={`w-full min-h-[44px] text-left rounded px-1 py-1 text-[10px] font-medium truncate flex flex-col justify-center ${eventTypeColor(
                            booking.event_type
                          )}`}
                          title={titleParts.join(' · ')}
                        >
                          {showVenueNameOnBookings && venueName ? (
                            <span className="block truncate" title={titleParts.join(' · ')}>
                              <span className="font-medium">{booking.client_name}</span>
                              <span className="opacity-90"> · {venueName}</span>
                            </span>
                          ) : (
                            booking.client_name
                          )}
                          {subtitle && (
                            <span className="block truncate text-[9px] opacity-85">{subtitle}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Legend:</span>
        {['mehndi', 'baraat', 'walima', 'nikah', 'engagement', 'other'].map((t) => (
          <span key={t} className={`rounded px-2 py-0.5 ${eventTypeColor(t)}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </span>
        ))}
      </div>

      <Sheet open={!!drawerBookingId} onOpenChange={(open) => !open && setDrawerBookingId(null)}>
        <SheetContent side="right" className="flex flex-col w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Booking</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 px-6 pb-6 pt-4">
            {drawerLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!drawerLoading && drawerDetail && (
              <div className="space-y-4">
                <p className="font-medium text-foreground">{(drawerDetail as { client_name: string }).client_name}</p>
                <p className="text-sm text-muted-foreground">
                  {(drawerDetail as { event_date: string }).event_date} ·{' '}
                  {String((drawerDetail as { event_type: string }).event_type ?? 'other').charAt(0).toUpperCase() +
                    String((drawerDetail as { event_type: string }).event_type ?? 'other').slice(1)}
                </p>
                <p className="text-sm">
                  Venue:{' '}
                  {(Array.isArray(drawerDetail.venues) ? drawerDetail.venues[0] : drawerDetail.venues)?.name ?? '—'}
                </p>
                {(() => {
                  const slotData = drawerDetail.venue_slots as { name: string; start_time?: string; end_time?: string } | { name: string; start_time?: string; end_time?: string }[] | null;
                  const slot = Array.isArray(slotData) ? slotData[0] ?? null : slotData;
                  return slot ? (
                    <p className="text-sm text-muted-foreground">
                      Time (slot):{' '}
                      {(() => {
                        const timeStr =
                          slot.start_time && slot.end_time
                            ? `${formatTime12h(slot.start_time)} – ${formatTime12h(slot.end_time)}`
                            : null;
                        return timeStr ? `${slot.name} (${timeStr})` : slot.name;
                      })()}
                    </p>
                  ) : null;
                })()}
                {(() => {
                  const floorData = drawerDetail.venue_floors as { name: string } | { name: string }[] | null;
                  const floor = Array.isArray(floorData) ? floorData[0] ?? null : floorData;
                  return floor ? (
                    <p className="text-sm text-muted-foreground">Floor: {floor.name}</p>
                  ) : null;
                })()}
                {(() => {
                  const pkgData = drawerDetail.venue_catering_packages as { name: string } | { name: string }[] | null;
                  const pkg = Array.isArray(pkgData) ? pkgData[0] ?? null : pkgData;
                  return pkg ? (
                    <p className="text-sm text-muted-foreground">Catering package: {pkg.name}</p>
                  ) : null;
                })()}
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/vendor/dashboard/bookings`}>View in list</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
