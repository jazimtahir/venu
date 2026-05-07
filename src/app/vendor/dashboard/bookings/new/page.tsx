import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { NewBookingForm } from './NewBookingForm';

interface PageProps {
  searchParams: Promise<{ inquiry_id?: string; date?: string }>;
}

export default async function NewBookingPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  if (!vendor) return null;

  const params = await searchParams;
  const inquiryId = params.inquiry_id?.trim() || null;
  const prefilledDate = params.date?.trim() || null;

  const { data: venues } = await supabase
    .from('venues')
    .select('id, name')
    .eq('vendor_id', vendor.id)
    .order('name');

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/vendor/dashboard/bookings"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to bookings
        </Link>
        <h2 className="text-h2 text-foreground font-normal mt-2">New booking</h2>
        {inquiryId && (
          <p className="mt-1 text-sm text-muted-foreground">Pre-filled from inquiry</p>
        )}
      </div>
      <NewBookingForm venues={venues ?? []} inquiryId={inquiryId} prefilledDate={prefilledDate} />
    </div>
  );
}
