'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking, getVenueBookingOptions, convertInquiryToBooking } from '@/app/actions/bookings';
import type { CreateBookingInput } from '@/app/actions/bookings';
import type { InquiryEventType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { formatTime12h } from '@/lib/utils';
import { getCached, setCached } from '@/lib/client-cache';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const VENUE_OPTIONS_CACHE_TTL_MS = 120_000; // 2 min
const PREFILL_CACHE_TTL_MS = 300_000; // 5 min for inquiry prefill

const EVENT_TYPES: { value: InquiryEventType; label: string }[] = [
  { value: 'mehndi', label: 'Mehndi' },
  { value: 'baraat', label: 'Baraat' },
  { value: 'walima', label: 'Walima' },
  { value: 'nikah', label: 'Nikah' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'other', label: 'Other' },
];

interface VenueOption {
  id: string;
  name: string;
}

interface NewBookingFormProps {
  venues: VenueOption[];
  inquiryId?: string | null;
  prefilledDate?: string | null;
}

export function NewBookingForm({ venues, inquiryId, prefilledDate }: NewBookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(!!inquiryId);
  const [form, setForm] = useState<CreateBookingInput>({
    venue_id: '',
    inquiry_id: null,
    client_name: '',
    client_phone: '',
    client_email: '',
    event_type: null,
    guest_count: null,
    event_date: prefilledDate ?? '',
    venue_slot_id: null,
    selected_floor: null,
    selected_package: null,
    total_amount: null,
    advance_paid: 0,
    booking_status: 'confirmed',
    notes: null,
  });
  const [options, setOptions] = useState<{
    slots: { id: string; name: string; start_time?: string; end_time?: string }[];
    floors: { id: string; name: string }[];
    packages: { id: string; name: string }[];
  }>({
    slots: [],
    floors: [],
    packages: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inquiryId) {
      setPrefillLoading(false);
      return;
    }
    const cacheKey = `booking-prefill-${inquiryId}`;
    const cached = getCached<NonNullable<Awaited<ReturnType<typeof convertInquiryToBooking>>['data']>>(cacheKey);
    if (cached) {
      setForm({
        venue_id: cached.venue_id,
        inquiry_id: cached.inquiry_id ?? null,
        client_name: cached.client_name,
        client_phone: cached.client_phone,
        client_email: cached.client_email ?? null,
        event_type: cached.event_type ?? null,
        guest_count: cached.guest_count ?? null,
        event_date: cached.event_date || '',
        venue_slot_id: cached.venue_slot_id ?? null,
        selected_floor: cached.selected_floor ?? null,
        selected_package: cached.selected_package ?? null,
        total_amount: cached.total_amount ?? null,
        advance_paid: cached.advance_paid ?? 0,
        booking_status: 'confirmed',
        notes: cached.notes ?? null,
      });
      setPrefillLoading(false);
      return;
    }
    convertInquiryToBooking(inquiryId).then((res) => {
      setPrefillLoading(false);
      if (res.data) {
        setCached(cacheKey, res.data, PREFILL_CACHE_TTL_MS);
        setForm({
          venue_id: res.data.venue_id,
          inquiry_id: res.data.inquiry_id ?? null,
          client_name: res.data.client_name,
          client_phone: res.data.client_phone,
          client_email: res.data.client_email ?? null,
          event_type: res.data.event_type ?? null,
          guest_count: res.data.guest_count ?? null,
          event_date: res.data.event_date || '',
          venue_slot_id: res.data.venue_slot_id ?? null,
          selected_floor: res.data.selected_floor ?? null,
          selected_package: res.data.selected_package ?? null,
          total_amount: res.data.total_amount ?? null,
          advance_paid: res.data.advance_paid ?? 0,
          booking_status: 'confirmed',
          notes: res.data.notes ?? null,
        });
      }
    });
  }, [inquiryId]);

  const loadVenueOptions = useCallback(async (venueId: string) => {
    if (!venueId) {
      setOptions({ slots: [], floors: [], packages: [] });
      return;
    }
    const cacheKey = `venue-booking-options-${venueId}`;
    const cached = getCached<NonNullable<Awaited<ReturnType<typeof getVenueBookingOptions>>['data']>>(cacheKey);
    if (cached) {
      setOptions(cached);
      return;
    }
    const res = await getVenueBookingOptions(venueId);
    if (res.data) {
      setOptions(res.data);
      setCached(cacheKey, res.data, VENUE_OPTIONS_CACHE_TTL_MS);
    } else setOptions({ slots: [], floors: [], packages: [] });
  }, []);

  useEffect(() => {
    if (form.venue_id) loadVenueOptions(form.venue_id);
    else setOptions({ slots: [], floors: [], packages: [] });
  }, [form.venue_id, loadVenueOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.venue_id || !form.client_name.trim() || !form.client_phone.trim() || !form.event_date) {
      setError('Venue, client name, phone and event date are required.');
      return;
    }
    setLoading(true);
    const result = await createBooking(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    if (result.id) {
      toast.success('Booking created successfully');
      router.push('/vendor/dashboard/bookings');
      return;
    }
    router.refresh();
  };

  if (prefillLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <p className="rounded border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="venue_id">Venue *</Label>
        <Select
          value={form.venue_id || undefined}
          onValueChange={(v) => setForm((f) => ({ ...f, venue_id: v, venue_slot_id: null, selected_floor: null, selected_package: null }))}
          required
        >
          <SelectTrigger id="venue_id">
            <SelectValue placeholder="Select venue" />
          </SelectTrigger>
          <SelectContent>
            {venues.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_name">Client name *</Label>
          <Input
            id="client_name"
            value={form.client_name}
            onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client_phone">Client phone *</Label>
          <Input
            id="client_phone"
            type="tel"
            value={form.client_phone}
            onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="client_email">Client email (optional)</Label>
        <Input
          id="client_email"
          type="email"
          value={form.client_email ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value || null }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event_date">Event date *</Label>
          <DatePicker
            id="event_date"
            value={form.event_date}
            onChange={(v) => setForm((f) => ({ ...f, event_date: v }))}
            placeholder="Pick a date"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event_type">Event type</Label>
          <Select
            value={form.event_type || 'other'}
            onValueChange={(v) => setForm((f) => ({ ...f, event_type: v as InquiryEventType }))}
          >
            <SelectTrigger id="event_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="guest_count">Guest count</Label>
        <Input
          id="guest_count"
          type="number"
          min={1}
          value={form.guest_count ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            setForm((f) => ({ ...f, guest_count: v === '' ? null : parseInt(v, 10) }));
          }}
        />
      </div>
      {options.slots.length > 0 && (
        <div className="space-y-2">
          <Label>Time (slot)</Label>
          <Select
            value={form.venue_slot_id || 'none'}
            onValueChange={(v) => setForm((f) => ({ ...f, venue_slot_id: v === 'none' ? null : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {options.slots.map((s) => {
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
      {options.floors.length > 0 && (
        <div className="space-y-2">
          <Label>Floor</Label>
          <Select
            value={form.selected_floor || 'none'}
            onValueChange={(v) => setForm((f) => ({ ...f, selected_floor: v === 'none' ? null : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {options.floors.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {options.packages.length > 0 && (
        <div className="space-y-2">
          <Label>Catering package</Label>
          <Select
            value={form.selected_package || 'none'}
            onValueChange={(v) => setForm((f) => ({ ...f, selected_package: v === 'none' ? null : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {options.packages.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="total_amount">Total amount (Rs)</Label>
          <Input
            id="total_amount"
            type="number"
            min={0}
            value={form.total_amount ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, total_amount: v === '' ? null : Number(v) }));
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="advance_paid">Advance paid (Rs)</Label>
          <Input
            id="advance_paid"
            type="number"
            min={0}
            value={form.advance_paid ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, advance_paid: Number(e.target.value) || 0 }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          className="flex min-h-[80px] w-full rounded border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-brand"
          value={form.notes ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create booking
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
