'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { PAKISTAN_CITIES } from '@/utils/constants';
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

export function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [capacity, setCapacity] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (capacity) params.set('capacity', capacity);
    router.push(params.toString() ? `/venues?${params.toString()}` : '/venues');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full max-w-3xl grid-cols-1 gap-y-4 rounded border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:grid-cols-[1fr_6rem_6rem_6rem_auto] sm:grid-rows-[auto_2.5rem] sm:gap-x-4 sm:gap-y-2 sm:p-7"
    >
      <Label htmlFor="search-city" className="text-xs uppercase tracking-wider text-muted-foreground sm:row-start-1 sm:col-start-1 sm:self-end sm:pb-1.5">
        City
      </Label>
      <div className="min-w-0 sm:row-start-2 sm:col-start-1 sm:h-10">
        <Select value={city || '_any'} onValueChange={(v) => setCity(v === '_any' ? '' : v)}>
          <SelectTrigger id="search-city" className="h-10 w-full">
            <SelectValue placeholder="Any city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_any">Any city</SelectItem>
            {PAKISTAN_CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Label htmlFor="search-min" className="text-xs uppercase tracking-wider text-muted-foreground sm:row-start-1 sm:col-start-2 sm:self-end sm:pb-1.5">
        Min (PKR)
      </Label>
      <div className="min-w-0 sm:row-start-2 sm:col-start-2 sm:h-10">
        <Input
          id="search-min"
          type="number"
          min={0}
          placeholder="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="h-10 w-full"
        />
      </div>
      <Label htmlFor="search-max" className="text-xs uppercase tracking-wider text-muted-foreground sm:row-start-1 sm:col-start-3 sm:self-end sm:pb-1.5">
        Max (PKR)
      </Label>
      <div className="min-w-0 sm:row-start-2 sm:col-start-3 sm:h-10">
        <Input
          id="search-max"
          type="number"
          min={0}
          placeholder="Any"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="h-10 w-full"
        />
      </div>
      <Label htmlFor="search-capacity" className="text-xs uppercase tracking-wider text-muted-foreground sm:row-start-1 sm:col-start-4 sm:self-end sm:pb-1.5">
        Capacity
      </Label>
      <div className="min-w-0 sm:row-start-2 sm:col-start-4 sm:h-10">
        <Input
          id="search-capacity"
          type="number"
          min={0}
          placeholder="0"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="h-10 w-full"
        />
      </div>
      <div className="sm:row-start-2 sm:col-start-5 sm:self-center flex pt-2 sm:pt-0">
        <Button type="submit" size="lg" className="h-11 min-h-[44px] shrink-0 px-6">
          <Search className="size-4" aria-hidden />
          Find venues
        </Button>
      </div>
    </form>
  );
}
