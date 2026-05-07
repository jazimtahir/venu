'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createVenueAsAdmin, updateVenueAsAdmin } from '@/app/actions/venue';
import { VENUE_TYPES } from '@/utils/constants';
import type { VenueType } from '@/types/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface VendorOption {
  id: string;
  business_name: string;
  city: string;
}

interface AdminVenueFormProps {
  vendors: VendorOption[];
  venue?: {
    id: string;
    vendor_id: string;
    name: string;
    city: string;
    area: string | null;
    capacity: number | null;
    venue_type: VenueType;
    description: string | null;
    address: string | null;
    google_maps_link: string | null;
    catering_included?: boolean;
    per_head_with_catering_min?: number | null;
    per_head_with_catering_max?: number | null;
    per_head_without_catering_min?: number | null;
    per_head_without_catering_max?: number | null;
  };
}

export function AdminVenueForm({ vendors, venue }: AdminVenueFormProps) {
  const router = useRouter();
  const isEdit = !!venue;
  const [vendorId, setVendorId] = useState(venue?.vendor_id ?? (vendors[0]?.id ?? ''));
  const [name, setName] = useState(venue?.name ?? '');
  const [city, setCity] = useState(venue?.city ?? '');
  const [area, setArea] = useState(venue?.area ?? '');
  const [capacity, setCapacity] = useState(venue?.capacity?.toString() ?? '');
  const [venueType, setVenueType] = useState<VenueType>(venue?.venue_type ?? 'indoor');
  const [description, setDescription] = useState(venue?.description ?? '');
  const [address, setAddress] = useState(venue?.address ?? '');
  const [googleMapsLink, setGoogleMapsLink] = useState(venue?.google_maps_link ?? '');
  const [cateringIncluded, setCateringIncluded] = useState(venue?.catering_included ?? false);
  const [perHeadWithCateringMin, setPerHeadWithCateringMin] = useState(venue?.per_head_with_catering_min?.toString() ?? '');
  const [perHeadWithCateringMax, setPerHeadWithCateringMax] = useState(venue?.per_head_with_catering_max?.toString() ?? '');
  const [perHeadWithoutCateringMin, setPerHeadWithoutCateringMin] = useState(venue?.per_head_without_catering_min?.toString() ?? '');
  const [perHeadWithoutCateringMax, setPerHeadWithoutCateringMax] = useState(venue?.per_head_without_catering_max?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass = 'w-full rounded border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-ring transition-all duration-200';
  const labelClass = 'block text-sm font-medium text-foreground mb-1.5';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (isEdit && venue) {
      const err = await updateVenueAsAdmin({
        venueId: venue.id,
        vendorId: vendorId || undefined,
        name,
        city,
        area: area || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        venueType,
        description: description || undefined,
        address: address || undefined,
        googleMapsLink: googleMapsLink || undefined,
        cateringIncluded,
        perHeadWithCateringMin: perHeadWithCateringMin ? Number(perHeadWithCateringMin) : undefined,
        perHeadWithCateringMax: perHeadWithCateringMax ? Number(perHeadWithCateringMax) : undefined,
        perHeadWithoutCateringMin: perHeadWithoutCateringMin ? Number(perHeadWithoutCateringMin) : undefined,
        perHeadWithoutCateringMax: perHeadWithoutCateringMax ? Number(perHeadWithoutCateringMax) : undefined,
      });
      if (err.error) {
        setLoading(false);
        setError(err.error);
        toast.error(err.error);
        return;
      }
      setLoading(false);
      toast.success('Venue updated');
      router.refresh();
    } else {
      const result = await createVenueAsAdmin({
        vendorId,
        name,
        city,
        area: area || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        venueType,
        description: description || undefined,
        address: address || undefined,
        googleMapsLink: googleMapsLink || undefined,
        cateringIncluded,
        perHeadWithCateringMin: perHeadWithCateringMin ? Number(perHeadWithCateringMin) : undefined,
        perHeadWithCateringMax: perHeadWithCateringMax ? Number(perHeadWithCateringMax) : undefined,
        perHeadWithoutCateringMin: perHeadWithoutCateringMin ? Number(perHeadWithoutCateringMin) : undefined,
        perHeadWithoutCateringMax: perHeadWithoutCateringMax ? Number(perHeadWithoutCateringMax) : undefined,
      });
      if (result.error) {
        setLoading(false);
        setError(result.error);
        toast.error(result.error);
        return;
      }
      setLoading(false);
      toast.success('Venue created');
      router.push(`/admin/venues/${result.id}/edit?created=1`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20">{error}</p>}

      {vendors.length > 0 && (
        <div>
          <label className={labelClass}>Vendor (owner){!isEdit && ' *'}</label>
          <Select value={vendorId} onValueChange={setVendorId}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.business_name} — {v.city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className={labelClass}>Venue name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>City *</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Area</label>
          <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Venue type *</label>
        <Select value={venueType} onValueChange={(v) => setVenueType(v as VenueType)}>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {VENUE_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className={labelClass}>Total capacity</label>
        <input type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} className={inputClass} placeholder="Max guests" />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="admin-catering"
          checked={cateringIncluded}
          onCheckedChange={(checked) => setCateringIncluded(checked === true)}
        />
        <label htmlFor="admin-catering" className="text-sm font-medium text-foreground cursor-pointer">Catering included</label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Per head with catering – min (PKR)</label>
          <input type="number" min={0} value={perHeadWithCateringMin} onChange={(e) => setPerHeadWithCateringMin(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Per head with catering – max (PKR)</label>
          <input type="number" min={0} value={perHeadWithCateringMax} onChange={(e) => setPerHeadWithCateringMax(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Per head without catering – min (PKR)</label>
          <input type="number" min={0} value={perHeadWithoutCateringMin} onChange={(e) => setPerHeadWithoutCateringMin(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Per head without catering – max (PKR)</label>
          <input type="number" min={0} value={perHeadWithoutCateringMax} onChange={(e) => setPerHeadWithoutCateringMax(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Address</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Google Maps link</label>
        <input type="url" value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} placeholder="https://www.google.com/maps/..." className={inputClass} />
      </div>
      <button type="submit" disabled={loading} className="rounded bg-brand px-6 py-3 text-sm font-medium text-[var(--page-bg)] hover:bg-brand-hover disabled:opacity-50 transition-colors duration-200">
        {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create venue'}
      </button>
    </form>
  );
}
