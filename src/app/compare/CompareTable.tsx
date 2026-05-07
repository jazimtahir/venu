'use client';

import Link from 'next/link';
import { RemoveFromCompareButton } from '@/components/venue/RemoveFromCompareButton';
import { COMPARE_MAX_VENUES } from '@/lib/compare';

function formatPrice(n: number | null) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export type CompareVenue = {
  id: string;
  name: string;
  slug: string;
  city: string;
  min_price: number | null;
  max_price: number | null;
  capacity: number | null;
  venue_type: string;
  venue_features?: { feature_name: string }[];
} & { is_verified?: boolean };

interface CompareTableProps {
  venues: CompareVenue[];
  idList: string[];
}

export function CompareTable({ venues, idList }: CompareTableProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-h1 text-foreground mb-2">Compare venues</h1>
      <p className="text-muted-foreground mb-8">
        Add venues from the <Link href="/venues" className="font-medium text-primary hover:underline">venues</Link> page or any venue card using <strong>Compare</strong>. You can compare up to {COMPARE_MAX_VENUES} venues.
      </p>

      {venues.length === 0 ? (
        <div className="rounded-2xl border border-border bg-section-alt p-8 text-center shadow-[var(--shadow-sm)]">
          <p className="text-muted-foreground">No venues to compare. Browse <Link href="/venues" className="font-medium text-primary hover:underline">venues</Link> and click <strong>Compare</strong> on a venue card to add it here.</p>
        </div>
      ) : (
        <div className="-mx-4 sm:mx-0 overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <p className="sm:hidden px-4 pt-2 text-xs text-muted-foreground">Scroll horizontally to compare</p>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/80">
                <th className="p-4 font-semibold text-foreground">Venue</th>
                {venues.map((v) => (
                  <th key={v.id} className="p-4 font-semibold text-foreground max-w-[200px]">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/venue/${v.slug}`} className="hover:text-primary transition-colors flex-1 min-w-0">
                        {v.name}
                      </Link>
                      <RemoveFromCompareButton venueId={v.id} allIds={idList} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border transition-colors hover:bg-muted/40">
                <td className="p-4 font-medium text-muted-foreground">City</td>
                {venues.map((v) => (
                  <td key={v.id} className="p-4 text-foreground">{v.city}</td>
                ))}
              </tr>
              <tr className="border-b border-border transition-colors hover:bg-muted/40">
                <td className="p-4 font-medium text-muted-foreground">Price range (PKR)</td>
                {venues.map((v) => (
                  <td key={v.id} className="p-4 text-foreground">
                    {formatPrice(v.min_price)} – {formatPrice(v.max_price)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border transition-colors hover:bg-muted/40">
                <td className="p-4 font-medium text-muted-foreground">Capacity</td>
                {venues.map((v) => (
                  <td key={v.id} className="p-4 text-foreground">{v.capacity ?? '—'}</td>
                ))}
              </tr>
              <tr className="border-b border-border transition-colors hover:bg-muted/40">
                <td className="p-4 font-medium text-muted-foreground">Type</td>
                {venues.map((v) => (
                  <td key={v.id} className="p-4 text-foreground capitalize">{v.venue_type}</td>
                ))}
              </tr>
              <tr className="border-b border-border transition-colors hover:bg-muted/40">
                <td className="p-4 font-medium text-muted-foreground">Verified</td>
                {venues.map((v) => (
                  <td key={v.id} className="p-4 text-foreground">{v.is_verified ? 'Yes' : '—'}</td>
                ))}
              </tr>
              <tr className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
                <td className="p-4 font-medium text-muted-foreground">Features</td>
                {venues.map((v) => (
                  <td key={v.id} className="p-4 text-foreground">
                    {(v.venue_features ?? []).map((f) => f.feature_name).join(', ') || '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
