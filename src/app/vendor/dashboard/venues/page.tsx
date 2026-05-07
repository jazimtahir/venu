import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { MapPin, Pencil, ExternalLink } from 'lucide-react';

export default async function VendorVenuesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  if (!vendor) return null;

  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, slug, city, is_featured, view_count, impression_count, wishlist_count, venue_images ( image_url )')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false });

  const venueList = venues ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-h2 text-foreground font-normal">My venues</h2>
        <Button asChild className="w-full sm:w-auto min-h-[44px]">
          <Link href="/vendor/dashboard/venues/new" className="gap-2">
            Add venue
          </Link>
        </Button>
      </div>

      {venueList.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {venueList.map((v) => {
            const imageUrl = v.venue_images?.[0]?.image_url ?? null;
            return (
              <div
                key={v.id}
                className="overflow-hidden rounded border border-border bg-section-alt shadow-[var(--shadow-soft)] transition-all duration-200 hover:shadow-[var(--shadow-card)] hover:border-brand/20"
              >
                <div className="flex gap-4 p-4 sm:p-5">
                  <div className="h-24 w-28 shrink-0 overflow-hidden rounded bg-section-alt">
                    {imageUrl ? (
                      <Image src={imageUrl} alt="" width={112} height={96} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <MapPin className="h-8 w-8" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">
                      <Link href={`/venue/${v.slug}`} className="hover:text-brand transition-colors">
                        {v.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {v.city}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(v as { view_count?: number }).view_count ?? 0} view{((v as { view_count?: number }).view_count ?? 0) !== 1 ? 's' : ''}
                      {' · '}
                      {(v as { impression_count?: number }).impression_count ?? 0} impression{((v as { impression_count?: number }).impression_count ?? 0) !== 1 ? 's' : ''}
                      {' · '}
                      {(v as { wishlist_count?: number }).wishlist_count ?? 0} wishlist{((v as { wishlist_count?: number }).wishlist_count ?? 0) !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button size="sm" asChild>
                        <Link href={`/vendor/dashboard/venues/${v.id}/edit`} className="gap-1.5">
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/venue/${v.slug}`} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded border border-dashed border-border bg-section-alt py-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 text-muted-foreground">You haven&apos;t added any venues yet.</p>
          <Button asChild className="mt-4">
            <Link href="/vendor/dashboard/venues/new">Add your first venue</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
