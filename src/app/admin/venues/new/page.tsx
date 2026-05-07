import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminVenueForm } from '../AdminVenueForm';

export default async function AdminNewVenuePage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, business_name, city')
    .eq('vendor_type', 'venue')
    .order('business_name');

  const list = vendors ?? [];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/venues" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">← Back to venues</Link>
        <h2 className="text-h2 text-foreground font-normal mt-2">Add venue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the basic details and assign a vendor. After saving, you can add images, packages, floors, and more.
        </p>
      </div>
      {list.length === 0 ? (
        <div className="rounded border border-dashed border-border bg-section-alt p-8 text-center">
          <p className="text-foreground">No vendors yet. Vendors must register as &quot;List your business&quot; before you can add venues for them.</p>
          <Link href="/admin/vendors" className="mt-4 inline-flex items-center justify-center rounded bg-brand px-4 py-2.5 text-sm font-medium text-[var(--page-bg)] hover:bg-brand-hover transition-colors duration-200">View vendors →</Link>
        </div>
      ) : (
        <section className="rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)]">
          <AdminVenueForm vendors={list} />
        </section>
      )}
    </div>
  );
}
