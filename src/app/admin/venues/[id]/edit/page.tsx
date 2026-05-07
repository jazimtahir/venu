import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { AdminVenueForm } from '../../AdminVenueForm';
import { VenueImagesEditor } from '@/app/vendor/dashboard/VenueImagesEditor';
import { VenueFeaturesEditor } from '@/app/vendor/dashboard/VenueFeaturesEditor';
import { VenueCateringPackagesEditor } from '@/app/vendor/dashboard/VenueCateringPackagesEditor';
import { VenueFloorsEditor } from '@/app/vendor/dashboard/VenueFloorsEditor';
import { VenueSlotsEditor } from '@/app/vendor/dashboard/VenueSlotsEditor';
import { VenueVideosEditor } from '@/app/vendor/dashboard/VenueVideosEditor';
import { VenueCreatedBanner } from '@/app/vendor/dashboard/venues/[id]/VenueCreatedBanner';
import { ExternalLink, MapPin } from 'lucide-react';

export default async function AdminEditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') notFound();

  const { data: venue } = await supabase
    .from('venues')
    .select(`
      *,
      venue_images ( id, image_url, display_order ),
      venue_features ( id, feature_name ),
      venue_catering_packages ( id, name, per_head_price, description, menu_text, display_order ),
      venue_floors ( id, name, capacity, display_order ),
      venue_slots ( id, name, start_time, end_time, display_order ),
      venue_videos ( id, video_url, display_order )
    `)
    .eq('id', id)
    .single();

  if (!venue) notFound();

  const { data: vendors } = await supabase.from('vendors').select('id, business_name, city').eq('vendor_type', 'venue').order('business_name');

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/venues" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">← Back to venues</Link>
        <h2 className="text-h2 text-foreground font-normal mt-2">Edit {venue.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Update basic info, images, and features.</p>
      </div>

      <Suspense fallback={null}>
        <VenueCreatedBanner />
      </Suspense>

      <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-h4 text-foreground mb-4">Basic info</h3>
        <AdminVenueForm vendors={vendors ?? []} venue={venue} />
      </section>

      <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-h4 text-foreground mb-4">Images</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add at least one photo so the venue stands out. Guests are more likely to inquire when they can see the space.
        </p>
        <VenueImagesEditor venueId={venue.id} images={venue.venue_images ?? []} />
      </section>

      <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-h4 text-foreground mb-4">Videos</h3>
        <VenueVideosEditor venueId={venue.id} videos={venue.venue_videos ?? []} />
      </section>

      <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-h4 text-foreground mb-4">Catering packages</h3>
        <VenueCateringPackagesEditor venueId={venue.id} packages={venue.venue_catering_packages ?? []} />
      </section>

      <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-h4 text-foreground mb-4">Floors / halls</h3>
        <VenueFloorsEditor venueId={venue.id} floors={venue.venue_floors ?? []} />
      </section>

      <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-h4 text-foreground mb-4">Booking slots</h3>
        <VenueSlotsEditor venueId={venue.id} slots={venue.venue_slots ?? []} />
      </section>

      <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-h4 text-foreground mb-4">Features</h3>
        <VenueFeaturesEditor venueId={venue.id} features={venue.venue_features ?? []} />
      </section>

      <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-h4 text-foreground mb-4">All set</h3>
        <p className="text-sm text-muted-foreground mb-4">
          View the venue as customers see it or return to the venue list.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild className="w-full min-h-[44px] sm:w-auto sm:min-h-0">
            <Link href={`/venue/${venue.slug}`} target="_blank" rel="noopener noreferrer" className="gap-2">
              <ExternalLink className="h-4 w-4" aria-hidden />
              View venue
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full min-h-[44px] sm:w-auto sm:min-h-0">
            <Link href="/admin/venues" className="gap-2">
              <MapPin className="h-4 w-4" aria-hidden />
              Back to venues
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
