'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { VenueFiltersClient } from './VenueFiltersClient';
import type { VenueSort } from '@/lib/venues';

export interface PendingFilterState {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minPricePerHead?: number;
  maxPricePerHead?: number;
  capacity?: number;
  venueType: string[];
  features: string[];
  cateringIncluded?: boolean;
  sort: VenueSort;
}

export interface VenueFiltersLayoutProps {
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
  basePath?: string;
  children: React.ReactNode;
}

function activeCountFromProps(props: {
  initialCity?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
  initialMinPricePerHead?: number;
  initialMaxPricePerHead?: number;
  initialCapacity?: number;
  initialVenueType: string[];
  initialFeatures: string[];
  initialCateringIncluded?: boolean;
}): number {
  let n = 0;
  if (props.initialCity) n++;
  if (props.initialMinPrice != null) n++;
  if (props.initialMaxPrice != null) n++;
  if (props.initialMinPricePerHead != null) n++;
  if (props.initialMaxPricePerHead != null) n++;
  if (props.initialCapacity != null) n++;
  if (props.initialVenueType.length) n += props.initialVenueType.length;
  if (props.initialFeatures.length) n += props.initialFeatures.length;
  if (props.initialCateringIncluded) n++;
  return n;
}

function propsToPending(props: VenueFiltersLayoutProps): PendingFilterState {
  return {
    city: props.initialCity,
    minPrice: props.initialMinPrice,
    maxPrice: props.initialMaxPrice,
    minPricePerHead: props.initialMinPricePerHead,
    maxPricePerHead: props.initialMaxPricePerHead,
    capacity: props.initialCapacity,
    venueType: props.initialVenueType ?? [],
    features: props.initialFeatures ?? [],
    cateringIncluded: props.initialCateringIncluded,
    sort: props.initialSort,
  };
}

export function VenueFiltersLayout({
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
  children,
}: VenueFiltersLayoutProps) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<PendingFilterState>(() =>
    propsToPending({
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
      basePath,
      children: null,
    })
  );

  useEffect(() => {
    if (sheetOpen) {
      setPendingFilters(propsToPending({
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
        basePath,
        children: null,
      }));
    }
  }, [sheetOpen, initialCity, initialMinPrice, initialMaxPrice, initialMinPricePerHead, initialMaxPricePerHead, initialCapacity, initialVenueType, initialFeatures, initialCateringIncluded, initialSort, basePath]);

  const applyPendingFilters = useCallback(() => {
    const isCityPage = basePath.startsWith('/city/');
    const next = new URLSearchParams();
    if (pendingFilters.city) next.set('city', pendingFilters.city);
    if (pendingFilters.minPrice != null) next.set('min_price', String(pendingFilters.minPrice));
    if (pendingFilters.maxPrice != null) next.set('max_price', String(pendingFilters.maxPrice));
    if (pendingFilters.minPricePerHead != null) next.set('min_price_per_head', String(pendingFilters.minPricePerHead));
    if (pendingFilters.maxPricePerHead != null) next.set('max_price_per_head', String(pendingFilters.maxPricePerHead));
    if (pendingFilters.capacity != null) next.set('capacity', String(pendingFilters.capacity));
    pendingFilters.venueType.forEach((v) => next.append('venue_type', v));
    pendingFilters.features.forEach((v) => next.append('feature', v));
    if (pendingFilters.cateringIncluded) next.set('catering_included', 'true');
    if (pendingFilters.sort) next.set('sort', pendingFilters.sort);
    const q = next.toString();
    if (isCityPage && pendingFilters.city) {
      const cityEncoded = encodeURIComponent(pendingFilters.city);
      router.push(q ? `/city/${cityEncoded}?${q}` : `/city/${cityEncoded}`);
    } else {
      router.push(q ? `${basePath}?${q}` : basePath);
    }
    setSheetOpen(false);
  }, [basePath, pendingFilters, router]);

  const activeCount = activeCountFromProps({
    initialCity,
    initialMinPrice,
    initialMaxPrice,
    initialMinPricePerHead,
    initialMaxPricePerHead,
    initialCapacity,
    initialVenueType,
    initialFeatures,
    initialCateringIncluded,
  });

  const filterProps = {
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
    basePath,
  };

  const sheetFilterProps = {
    initialCity: pendingFilters.city,
    initialMinPrice: pendingFilters.minPrice,
    initialMaxPrice: pendingFilters.maxPrice,
    initialMinPricePerHead: pendingFilters.minPricePerHead,
    initialMaxPricePerHead: pendingFilters.maxPricePerHead,
    initialCapacity: pendingFilters.capacity,
    initialVenueType: pendingFilters.venueType,
    initialFeatures: pendingFilters.features,
    initialCateringIncluded: pendingFilters.cateringIncluded,
    initialSort: pendingFilters.sort,
    basePath,
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Desktop: sidebar visible from lg - apply on every change */}
      <aside className="hidden lg:block lg:w-72 shrink-0">
        <VenueFiltersClient {...filterProps} />
      </aside>
      {/* Mobile: Filters button + Sheet - apply only on "Show results" */}
      <div className="lg:hidden w-full">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="w-full min-h-[44px] gap-2 border-border"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters{activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] flex flex-col p-0 rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
          >
            <SheetHeader className="p-4 border-b border-border shrink-0">
              <SheetTitle className="text-left">Filters</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto overflow-x-hidden flex-1 p-4 min-h-0">
              <VenueFiltersClient
                {...sheetFilterProps}
                applyOnChange={false}
                onPendingChange={setPendingFilters}
              />
            </div>
            <div className="p-4 pt-3 border-t border-border shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                className="w-full min-h-[44px]"
                onClick={applyPendingFilters}
              >
                Show results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
