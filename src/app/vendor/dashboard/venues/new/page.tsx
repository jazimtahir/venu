import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VenueForm } from '../../VenueForm';

export default async function NewVenuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  if (!vendor) redirect('/dashboard');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-h2 text-foreground font-normal">Add a venue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the basic details below and save. You’ll then be able to add photos, packages, floors, and more.
        </p>
      </div>
      <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
        <VenueForm vendorId={vendor.id} />
      </section>
    </div>
  );
}
