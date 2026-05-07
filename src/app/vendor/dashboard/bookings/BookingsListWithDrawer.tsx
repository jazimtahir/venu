'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, User, X, Loader2, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  getVendorBookingById,
  updateBookingStatus,
  updateBookingPayment,
} from '@/app/actions/bookings';
import type { BookingStatus } from '@/types/database';
import { formatTime12h } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function statusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-500/15 text-emerald-700';
    case 'completed':
      return 'bg-sage/80 text-ink';
    case 'cancelled':
      return 'bg-muted/80 text-muted-foreground';
    default:
      return 'bg-muted/80 text-muted-foreground';
  }
}

function eventTypeLabel(t: string | null | undefined): string {
  if (!t) return 'Other';
  return String(t).charAt(0).toUpperCase() + String(t).slice(1);
}

type BookingRow = {
  id: string;
  venue_id: string;
  client_name: string;
  client_phone: string;
  event_type: string | null;
  event_date: string;
  total_amount: number | null;
  advance_paid: number;
  booking_status: BookingStatus;
  venues: { name: string; slug: string } | null;
};

interface BookingsListWithDrawerProps {
  bookings: BookingRow[];
  venues: { id: string; name: string }[];
}

function remainingBalance(total: number | null, advance: number): number | null {
  if (total == null) return null;
  return Math.max(0, Number(total) - Number(advance));
}

export function BookingsListWithDrawer({ bookings, venues }: BookingsListWithDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getVendorBookingById>>['data']>(null);
  const [loading, setLoading] = useState(false);
  const [advanceInput, setAdvanceInput] = useState('');

  const handleRowClick = useCallback((id: string) => {
    setSelectedId(id);
    setOpen(true);
    setLoading(true);
    setDetail(null);
    getVendorBookingById(id).then((res) => {
      setDetail(res.data);
      setAdvanceInput(res.data?.advance_paid != null ? String(res.data.advance_paid) : '');
      setLoading(false);
    });
  }, []);

  const handleStatusChange = useCallback(
    async (bookingId: string, status: BookingStatus) => {
      const res = await updateBookingStatus(bookingId, status);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Booking status updated');
      if (detail && detail.id === bookingId) setDetail({ ...detail, booking_status: status });
      router.refresh();
    },
    [detail, router]
  );

  const handleAdvanceChange = useCallback(
    async (bookingId: string) => {
      const num = advanceInput === '' ? 0 : Number(advanceInput);
      if (Number.isNaN(num) || num < 0) return;
      const res = await updateBookingPayment(bookingId, num);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Advance payment updated');
      if (detail && detail.id === bookingId) setDetail({ ...detail, advance_paid: num });
      router.refresh();
    },
    [advanceInput, detail, router]
  );

  const statusFilter = searchParams.get('status') || '';
  const venueFilter = searchParams.get('venue_id') || '';
  const fromFilter = searchParams.get('from_date') || '';
  const toFilter = searchParams.get('to_date') || '';

  const setFilter = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/vendor/dashboard/bookings?${next.toString()}`);
    },
    [router, searchParams]
  );

  const activeFilterCount = [statusFilter, venueFilter, fromFilter, toFilter].filter(Boolean).length;

  const filterControls = (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Status</span>
        <Select value={statusFilter || 'all'} onValueChange={(v) => setFilter('status', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Venue</span>
        <Select value={venueFilter || 'all'} onValueChange={(v) => setFilter('venue_id', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Venue" />
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
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">From date</span>
        <DatePicker
          placeholder="From"
          className="w-full"
          value={fromFilter}
          onChange={(v) => setFilter('from_date', v)}
        />
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">To date</span>
        <DatePicker
          placeholder="To"
          className="w-full"
          value={toFilter}
          onChange={(v) => setFilter('to_date', v)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Desktop: inline filters */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        <Select value={statusFilter || 'all'} onValueChange={(v) => setFilter('status', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={venueFilter || 'all'} onValueChange={(v) => setFilter('venue_id', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Venue" />
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
        <DatePicker
          placeholder="From"
          className="w-[140px]"
          value={fromFilter}
          onChange={(v) => setFilter('from_date', v)}
        />
        <DatePicker
          placeholder="To"
          className="w-[140px]"
          value={toFilter}
          onChange={(v) => setFilter('to_date', v)}
        />
      </div>

      {/* Mobile: Filters button + Sheet */}
      <div className="md:hidden w-full">
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="w-full min-h-[44px] gap-2 border-border"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
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
              {filterControls}
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

      {bookings.length > 0 ? (
        <ul className="space-y-2">
          {bookings.map((b) => {
            const venue = b.venues ? (Array.isArray(b.venues) ? b.venues[0] : b.venues) : null;
            const remaining = remainingBalance(b.total_amount, b.advance_paid);
            return (
              <li
                key={b.id}
                role="button"
                tabIndex={0}
                onClick={() => handleRowClick(b.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleRowClick(b.id)}
                className="flex flex-col gap-2 rounded border border-border bg-section-alt p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-brand/30 cursor-pointer md:flex-row md:flex-wrap md:items-center md:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">{b.client_name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {eventTypeLabel(b.event_type)} · {new Date(b.event_date).toLocaleDateString()}
                  </span>
                </div>
                {venue && (
                  <Link
                    href={`/venue/${venue.slug}`}
                    className="text-sm font-medium text-brand hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {venue.name}
                  </Link>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm md:contents">
                  <span className="text-foreground">
                    {b.total_amount != null ? `Rs ${Number(b.total_amount).toLocaleString()}` : '—'}
                  </span>
                  <span className="text-muted-foreground">
                    Advance: Rs {Number(b.advance_paid).toLocaleString()}
                  </span>
                  {remaining != null && (
                    <span className="font-medium text-foreground">
                      Remaining: Rs {remaining.toLocaleString()}
                    </span>
                  )}
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass(b.booking_status)}`}>
                    {STATUS_OPTIONS.find((o) => o.value === b.booking_status)?.label ?? b.booking_status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded border border-dashed border-border bg-section-alt py-16 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 text-muted-foreground">No bookings match your filters.</p>
          <Button asChild className="mt-4">
            <Link href="/vendor/dashboard/bookings/new">Add booking</Link>
          </Button>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col w-full max-w-md overflow-y-auto">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Booking detail</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 space-y-6 pt-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && detail && (
              <>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {(detail as { client_name: string }).client_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(detail as { client_phone: string }).client_phone}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Event: {new Date((detail as { event_date: string }).event_date).toLocaleDateString()}
                    {' · '}
                    {eventTypeLabel((detail as { event_type: string | null }).event_type)}
                  </p>
                  {(() => {
                    const vData = detail.venues as { name: string; slug: string } | { name: string; slug: string }[] | null;
                    const v = Array.isArray(vData) ? vData[0] ?? null : vData;
                    return v ? (
                      <Link href={`/venue/${v.slug}`} className="text-sm font-medium text-brand hover:underline">
                        {v.name}
                      </Link>
                    ) : null;
                  })()}
                  {(() => {
                    const slotData = detail.venue_slots as { name: string; start_time?: string; end_time?: string } | { name: string; start_time?: string; end_time?: string }[] | null;
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
                    const floorData = detail.venue_floors as { name: string } | { name: string }[] | null;
                    const floor = Array.isArray(floorData) ? floorData[0] ?? null : floorData;
                    return floor ? (
                      <p className="text-sm text-muted-foreground">Floor: {floor.name}</p>
                    ) : null;
                  })()}
                  {(() => {
                    const pkgData = detail.venue_catering_packages as { name: string } | { name: string }[] | null;
                    const pkg = Array.isArray(pkgData) ? pkgData[0] ?? null : pkgData;
                    return pkg ? (
                      <p className="text-sm text-muted-foreground">Catering package: {pkg.name}</p>
                    ) : null;
                  })()}
                </div>

                <div className="space-y-3">
                  <Label className="text-muted-foreground">Status</Label>
                  <Select
                    value={(detail as { booking_status: BookingStatus }).booking_status}
                    onValueChange={(v) =>
                      handleStatusChange((detail as { id: string }).id, v as BookingStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-muted-foreground">Advance paid (Rs)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={advanceInput}
                      onChange={(e) => setAdvanceInput(e.target.value)}
                      onBlur={() => handleAdvanceChange((detail as { id: string }).id)}
                    />
                  </div>
                  {(detail as { total_amount: number | null }).total_amount != null && (
                    <p className="text-sm text-muted-foreground">
                      Remaining: Rs{' '}
                      {remainingBalance(
                        (detail as { total_amount: number | null }).total_amount,
                        (detail as { advance_paid: number }).advance_paid
                      )?.toLocaleString() ?? '—'}
                    </p>
                  )}
                </div>

                {(detail as { notes: string | null }).notes && (
                  <div className="border-t border-border pt-4">
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="mt-1 text-sm text-foreground">{(detail as { notes: string }).notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
