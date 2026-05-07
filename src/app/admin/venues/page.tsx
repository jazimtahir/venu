import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { setFeaturedAction, setVerifiedAction } from './actions';
import { DeleteVenueButton } from './DeleteVenueButton';
import { AdminPendingButton } from '@/components/admin/AdminPendingButton';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Star, MapPin, CheckCircle } from 'lucide-react';

export default async function AdminVenuesPage() {
  const supabase = await createClient();
  const { data: venues } = await supabase
    .from('venues')
    .select(`
      id,
      name,
      slug,
      city,
      is_featured,
      is_verified,
      view_count,
      impression_count,
      wishlist_count,
      vendors ( business_name )
    `)
    .order('created_at', { ascending: false });

  const list = venues ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-h2 text-foreground font-normal">All venues</h2>
        <Button asChild className="w-full min-h-[44px] sm:w-auto sm:min-h-0">
          <Link href="/admin/venues/new" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            Add venue
          </Link>
        </Button>
      </div>
      {list.length > 0 ? (
        <div className="overflow-x-auto rounded border border-border shadow-[var(--shadow-soft)]">
          <p className="sm:hidden px-4 pt-2 text-xs text-muted-foreground">Scroll horizontally to see all columns</p>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-section-alt/80">
                <th className="p-4 font-semibold text-foreground">Venue</th>
                <th className="p-4 font-semibold text-foreground">Vendor</th>
                <th className="p-4 font-semibold text-foreground">City</th>
                <th className="p-4 font-semibold text-foreground">Featured</th>
                <th className="p-4 font-semibold text-foreground">Verified</th>
                <th className="p-4 font-semibold text-foreground">Views</th>
                <th className="p-4 font-semibold text-foreground">Impressions</th>
                <th className="p-4 font-semibold text-foreground">Wishlist</th>
                <th className="p-4 font-semibold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((v) => {
                const vendor = Array.isArray(v.vendors) ? v.vendors[0] : v.vendors;
                return (
                  <tr key={v.id} className="border-b border-border last:border-0 transition-colors duration-200 hover:bg-section-alt/60">
                    <td className="p-4">
                      <Link href={`/venue/${v.slug}`} className="font-medium text-foreground hover:text-brand transition-colors">
                        {v.name}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{vendor?.business_name ?? '—'}</td>
                    <td className="p-4 text-foreground">{v.city}</td>
                    <td className="p-4">
                      <form action={setFeaturedAction} className="inline">
                        <input type="hidden" name="venueId" value={v.id} />
                        <input type="hidden" name="featured" value={v.is_featured ? 'false' : 'true'} />
                        <AdminPendingButton
                          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${v.is_featured ? 'bg-brand/15 text-brand hover:bg-brand/25' : 'bg-section-alt text-muted-foreground hover:bg-section-alt/80'}`}
                        >
                          <Star className={`h-3.5 w-3.5 ${v.is_featured ? 'fill-brand text-brand' : ''}`} aria-hidden />
                          {v.is_featured ? 'Featured' : 'Set featured'}
                        </AdminPendingButton>
                      </form>
                    </td>
                    <td className="p-4">
                      <form action={setVerifiedAction} className="inline">
                        <input type="hidden" name="venueId" value={v.id} />
                        <input type="hidden" name="verified" value={v.is_verified ? 'false' : 'true'} />
                        <AdminPendingButton
                          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${v.is_verified ? 'bg-brand/15 text-brand hover:bg-brand/25' : 'bg-section-alt text-muted-foreground hover:bg-section-alt/80'}`}
                        >
                          <CheckCircle className={`h-3.5 w-3.5 ${v.is_verified ? 'text-brand' : ''}`} aria-hidden />
                          {v.is_verified ? 'Verified' : 'Verify'}
                        </AdminPendingButton>
                      </form>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {((v as { view_count?: number }).view_count ?? 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {((v as { impression_count?: number }).impression_count ?? 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {((v as { wishlist_count?: number }).wishlist_count ?? 0).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild className="min-h-[44px] sm:min-h-0">
                          <Link href={`/admin/venues/${v.id}/edit`} className="gap-1.5">
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            Edit
                          </Link>
                        </Button>
                        <DeleteVenueButton venueId={v.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded border border-dashed border-border bg-section-alt py-16 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="mt-4 text-muted-foreground">No venues yet.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/venues/new">Add your first venue</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
