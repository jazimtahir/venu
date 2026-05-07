'use client';

import { useState, useRef, useEffect } from 'react';
import { submitInquiry } from '@/app/actions/inquiry';
import { EVENT_TYPES } from '@/utils/constants';
import type { VenueSlot } from '@/types/database';
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

interface CateringPackageOption {
  id: string;
  name: string;
  per_head_price: number;
}

interface FloorOption {
  id: string;
  name: string;
  capacity: number | null;
}

interface InquiryFormProps {
  venueId: string;
  venueName: string;
  offeredSlots?: VenueSlot[];
  cateringPackages?: CateringPackageOption[];
  floors?: FloorOption[];
}

export function InquiryForm({ venueId, venueName, offeredSlots = [], cateringPackages = [], floors = [] }: InquiryFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [preferredSlotId, setPreferredSlotId] = useState('');
  const [interestedPackageId, setInterestedPackageId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [eventType, setEventType] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const successRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const result = await submitInquiry({
      venueId,
      name,
      phone,
      eventDate: eventDate || null,
      message: message || null,
      preferredSlot: null,
      interestedPackageId: interestedPackageId || null,
      floorId: floorId || null,
      preferredSlotId: preferredSlotId || null,
      eventType: eventType || null,
      honeypot: honeypot || undefined,
    });
    if (result.success) {
      setStatus('success');
      setName('');
      setPhone('');
      setEventDate('');
      setPreferredSlotId('');
      setInterestedPackageId('');
      setFloorId('');
      setEventType('');
      setMessage('');
    } else {
      setStatus('error');
      setErrorMsg(result.error ?? 'Something went wrong.');
    }
  }

  useEffect(() => {
    if (status === 'success' && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [status]);

  if (status === 'success') {
    return (
      <div ref={successRef} className="min-h-[320px]" aria-live="polite">
        <p className="text-sm text-foreground bg-brand/10 rounded p-4 border border-brand/20">
          Thank you! Your inquiry has been sent. We&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'error' && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20">{errorMsg}</p>
      )}
      <div className="absolute -left-[9999px] w-1 h-1 overflow-hidden" aria-hidden>
        <label htmlFor="inquiry-website">Website</label>
        <input
          id="inquiry-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-name">Your name</Label>
        <Input id="inquiry-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-phone">Phone</Label>
        <Input id="inquiry-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-date">Event date (optional)</Label>
        <DatePicker id="inquiry-date" value={eventDate} onChange={setEventDate} placeholder="Pick a date" className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-event-type">Event type (optional)</Label>
        <Select value={eventType || '_none'} onValueChange={(v) => setEventType(v === '_none' ? '' : v)}>
          <SelectTrigger id="inquiry-event-type" className="h-11 w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">Select</SelectItem>
            {EVENT_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {offeredSlots.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="inquiry-slot">Preferred slot (optional)</Label>
          <Select value={preferredSlotId || '_none'} onValueChange={(v) => setPreferredSlotId(v === '_none' ? '' : v)}>
            <SelectTrigger id="inquiry-slot" className="h-11 w-full">
              <SelectValue placeholder="No preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No preference</SelectItem>
              {offeredSlots.map((slot) => {
                const timeStr =
                  slot.start_time && slot.end_time
                    ? ` (${formatTime12h(slot.start_time)} – ${formatTime12h(slot.end_time)})`
                    : '';
                return (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.name}{timeStr}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      {cateringPackages.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="inquiry-package">Interested in package (optional)</Label>
          <Select value={interestedPackageId || '_none'} onValueChange={(v) => setInterestedPackageId(v === '_none' ? '' : v)}>
            <SelectTrigger id="inquiry-package" className="h-11 w-full">
              <SelectValue placeholder="No preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No preference</SelectItem>
              {cateringPackages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name} – Rs {pkg.per_head_price.toLocaleString()}/head
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {floors.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="inquiry-floor">Preferred floor / hall (optional)</Label>
          <Select value={floorId || '_none'} onValueChange={(v) => setFloorId(v === '_none' ? '' : v)}>
            <SelectTrigger id="inquiry-floor" className="h-11 w-full">
              <SelectValue placeholder="No preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No preference</SelectItem>
              {floors.map((floor) => (
                <SelectItem key={floor.id} value={floor.id}>
                  {floor.name}
                  {floor.capacity != null ? ` (up to ${floor.capacity} guests)` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="inquiry-message">Message (optional)</Label>
        <textarea
          id="inquiry-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex w-full rounded border border-border bg-card px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-brand min-h-[80px]"
        />
      </div>
      <Button type="submit" disabled={status === 'loading'} className="w-full h-11">
        {status === 'loading' ? 'Sending…' : 'Send inquiry'}
      </Button>
    </form>
  );
}
