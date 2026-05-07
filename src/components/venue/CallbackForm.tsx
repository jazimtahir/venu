'use client';

import { useState } from 'react';
import { submitCallbackLead } from '@/app/actions/callback';
import { PAKISTAN_CITIES } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

export function CallbackForm() {
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const result = await submitCallbackLead({
      phone: phone.trim(),
      city: city.trim(),
      eventDate: eventDate || null,
    });
    if (result.success) {
      setStatus('success');
      setPhone('');
      setCity('');
      setEventDate('');
    } else {
      setStatus('error');
      setErrorMsg(result.error ?? 'Something went wrong.');
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm text-foreground bg-brand/10 rounded p-4 border border-brand/20">
        Thanks! We&apos;ll call you soon to help find your perfect venue.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'error' && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20">{errorMsg}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="callback-phone">Mobile number</Label>
        <Input
          id="callback-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="03XX XXXXXXX"
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="callback-city">City</Label>
        <select
          id="callback-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="flex h-11 w-full rounded border border-border bg-card px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-brand"
        >
          <option value="">Select city</option>
          {PAKISTAN_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="callback-date">Event date (optional)</Label>
        <DatePicker
          id="callback-date"
          value={eventDate}
          onChange={setEventDate}
          placeholder="Pick a date"
          className="h-11"
        />
      </div>
      <Button type="submit" disabled={status === 'loading'} className="w-full h-11">
        {status === 'loading' ? 'Submitting…' : 'Request callback'}
      </Button>
    </form>
  );
}
