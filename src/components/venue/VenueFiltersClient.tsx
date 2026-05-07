'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { PAKISTAN_CITIES, VENUE_TYPES, COMMON_FEATURES } from '@/utils/constants';
import type { VenueSort } from '@/lib/venues';
import type { PendingFilterState } from './VenueFiltersLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VenueFiltersClientProps {
  initialCity?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
  initialMinPricePerHead?: number;
  initialMaxPricePerHead?: number;
  initialCapacity?: number;
  initialVenueType: string[];
  initialFeatures: string[];
  initialCateringIncluded?: boolean;
  initialSort: VenueSort;
  /** For city page: e.g. /city/Lahore. Omit for /venues */
  basePath?: string;
  /** When false (mobile sheet), do not push URL on change; call onPendingChange instead */
  applyOnChange?: boolean;
  /** Called when applyOnChange is false and user changes a filter */
  onPendingChange?: (state: PendingFilterState) => void;
}

export function VenueFiltersClient({
  initialCity,
  initialMinPrice,
  initialMaxPrice,
  initialMinPricePerHead,
  initialMaxPricePerHead,
  initialCapacity,
  initialVenueType,
  initialFeatures,
  initialCateringIncluded,
  initialSort,
  basePath = '/venues',
  applyOnChange = true,
  onPendingChange,
}: VenueFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCityPage = basePath.startsWith('/city/');

  const [pending, setPending] = useState<PendingFilterState>(() => ({
    city: initialCity,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    minPricePerHead: initialMinPricePerHead,
    maxPricePerHead: initialMaxPricePerHead,
    capacity: initialCapacity,
    venueType: initialVenueType ?? [],
    features: initialFeatures ?? [],
    cateringIncluded: initialCateringIncluded,
    sort: initialSort,
  }));

  const isControlled = !applyOnChange && onPendingChange;
  const city = isControlled ? pending.city : initialCity;
  const minPrice = isControlled ? pending.minPrice : initialMinPrice;
  const maxPrice = isControlled ? pending.maxPrice : initialMaxPrice;
  const minPricePerHead = isControlled ? pending.minPricePerHead : initialMinPricePerHead;
  const maxPricePerHead = isControlled ? pending.maxPricePerHead : initialMaxPricePerHead;
  const capacity = isControlled ? pending.capacity : initialCapacity;
  const venueType = isControlled ? pending.venueType : initialVenueType;
  const features = isControlled ? pending.features : initialFeatures;
  const cateringIncluded = isControlled ? pending.cateringIncluded : initialCateringIncluded;
  const sort = isControlled ? pending.sort : initialSort;

  const updatePending = useCallback(
    (updates: Partial<PendingFilterState>) => {
      setPending((prev) => {
        const next = { ...prev, ...updates };
        onPendingChange?.(next);
        return next;
      });
    },
    [onPendingChange]
  );

  const updateParams = useCallback(
    (updates: Record<string, string | number | string[] | undefined>) => {
      if (isControlled) {
        const stateUpdates: Partial<PendingFilterState> = {};
        if ('city' in updates) stateUpdates.city = updates.city as string | undefined;
        if ('min_price' in updates) stateUpdates.minPrice = updates.min_price as number | undefined;
        if ('max_price' in updates) stateUpdates.maxPrice = updates.max_price as number | undefined;
        if ('min_price_per_head' in updates) stateUpdates.minPricePerHead = updates.min_price_per_head as number | undefined;
        if ('max_price_per_head' in updates) stateUpdates.maxPricePerHead = updates.max_price_per_head as number | undefined;
        if ('capacity' in updates) stateUpdates.capacity = updates.capacity as number | undefined;
        if ('venue_type' in updates) stateUpdates.venueType = (updates.venue_type as string[]) ?? [];
        if ('feature' in updates) stateUpdates.features = (updates.feature as string[]) ?? [];
        if ('catering_included' in updates) stateUpdates.cateringIncluded = updates.catering_included === 'true';
        if ('sort' in updates) stateUpdates.sort = (updates.sort as VenueSort) ?? 'featured';
        updatePending(stateUpdates);
        return;
      }
      const next = new URLSearchParams(searchParams.toString());
      let newCity: string | undefined;
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'city' && isCityPage && typeof value === 'string') {
          newCity = value;
          continue;
        }
        if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          next.delete(key);
          if (key === 'feature') {
            next.delete('feature');
            for (const k of next.keys()) if (k.startsWith('feature')) next.delete(k);
          }
          continue;
        }
        if (Array.isArray(value)) {
          next.delete(key);
          value.forEach((v) => next.append(key, v));
        } else {
          next.set(key, String(value));
        }
      }
      next.delete('page');
      const q = next.toString();
      if (isCityPage && newCity !== undefined) {
        router.push(q ? `/city/${encodeURIComponent(newCity)}?${q}` : `/city/${encodeURIComponent(newCity)}`);
        return;
      }
      router.push(q ? `${basePath}?${q}` : basePath);
    },
    [router, searchParams, basePath, isCityPage, isControlled, updatePending]
  );

  const toggleArray = (key: 'venue_type' | 'feature', value: string) => {
    const current = key === 'venue_type' ? venueType : features;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: next });
  };

  const activeCount = useMemo(() => {
    let n = 0;
    if (city) n++;
    if (minPrice != null) n++;
    if (maxPrice != null) n++;
    if (minPricePerHead != null) n++;
    if (maxPricePerHead != null) n++;
    if (capacity != null) n++;
    if (venueType.length) n += venueType.length;
    if (features.length) n += features.length;
    if (cateringIncluded) n++;
    return n;
  }, [city, minPrice, maxPrice, minPricePerHead, maxPricePerHead, capacity, venueType, features, cateringIncluded]);

  const clearAll = useCallback(() => {
    if (isControlled) {
      updatePending({
        city: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        minPricePerHead: undefined,
        maxPricePerHead: undefined,
        capacity: undefined,
        venueType: [],
        features: [],
        cateringIncluded: undefined,
      });
      return;
    }
    updateParams({
      city: undefined,
      min_price: undefined,
      max_price: undefined,
      min_price_per_head: undefined,
      max_price_per_head: undefined,
      capacity: undefined,
      venue_type: [],
      feature: [],
      catering_included: undefined,
    });
  }, [updateParams, isControlled, updatePending]);

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] overflow-x-hidden">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold text-foreground">Filters</h2>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" size="sm" className="h-auto min-h-[44px] min-w-[44px] px-2 text-xs text-primary hover:text-primary/90 flex items-center justify-center" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>
      {activeCount > 0 && (
        <p className="text-xs text-muted-foreground">{activeCount} filter{activeCount !== 1 ? 's' : ''} applied</p>
      )}

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">City</Label>
        <Select value={city ?? '_all'} onValueChange={(v) => updateParams({ city: v === '_all' ? undefined : v })}>
          <SelectTrigger className="min-h-[44px]">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All cities</SelectItem>
            {PAKISTAN_CITIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min budget (PKR)</Label>
        <Input type="number" min={0} className="min-h-[44px]" value={minPrice ?? ''} onChange={(e) => updateParams({ min_price: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Max budget (PKR)</Label>
        <Input type="number" min={0} className="min-h-[44px]" value={maxPrice ?? ''} onChange={(e) => updateParams({ max_price: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min capacity</Label>
        <Input type="number" min={0} className="min-h-[44px]" value={capacity ?? ''} onChange={(e) => updateParams({ capacity: e.target.value ? Number(e.target.value) : undefined })} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min per head (PKR)</Label>
        <Input type="number" min={0} className="min-h-[44px]" value={minPricePerHead ?? ''} onChange={(e) => updateParams({ min_price_per_head: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Max per head (PKR)</Label>
        <Input type="number" min={0} className="min-h-[44px]" value={maxPricePerHead ?? ''} onChange={(e) => updateParams({ max_price_per_head: e.target.value ? Number(e.target.value) : undefined })} />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm min-h-[44px] py-2">
        <Checkbox
          checked={!!cateringIncluded}
          onCheckedChange={(checked) => updateParams({ catering_included: checked ? 'true' : undefined })}
        />
        <span className="text-muted-foreground">Catering included</span>
      </label>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Venue type</Label>
        <div className="space-y-1">
          {VENUE_TYPES.map(({ value, label }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm min-h-[44px] py-2">
              <Checkbox
                checked={venueType.includes(value)}
                onCheckedChange={() => toggleArray('venue_type', value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Features</Label>
        <div className="max-h-40 space-y-1 overflow-y-auto overflow-x-hidden">
          {COMMON_FEATURES.map((f) => (
            <label key={f} className="flex cursor-pointer items-center gap-2 text-sm min-h-[44px] py-2">
              <Checkbox
                checked={features.includes(f)}
                onCheckedChange={() => toggleArray('feature', f)}
              />
              {f}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Sort by</Label>
        <Select value={sort} onValueChange={(v) => updateParams({ sort: v as VenueSort })}>
          <SelectTrigger className="min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured first</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="capacity_desc">Capacity: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
