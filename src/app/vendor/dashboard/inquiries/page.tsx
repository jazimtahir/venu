import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import { getVendorInquiries } from '@/app/actions/inquiries';
import { InquiriesListWithDrawer } from './InquiriesListWithDrawer';
import type { InquiryStatus, InquirySource } from '@/types/database';

interface PageProps {
  searchParams: Promise<{ status?: string; source?: string; venue_id?: string }>;
}

export default async function VendorInquiriesPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
  if (!vendor) return null;

  const params = await searchParams;
  const filters: { status?: InquiryStatus; source?: InquirySource; venue_id?: string } = {};
  if (params.status && ['new', 'contacted', 'negotiating', 'confirmed', 'lost'].includes(params.status)) {
    filters.status = params.status as InquiryStatus;
  }
  if (params.source && ['marketplace', 'walk_in', 'phone', 'referral'].includes(params.source)) {
    filters.source = params.source as InquirySource;
  }
  if (params.venue_id) filters.venue_id = params.venue_id;

  const { data: inquiriesRaw } = await getVendorInquiries(filters);
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, slug')
    .eq('vendor_id', vendor.id)
    .order('name');

  const inquiries = (inquiriesRaw ?? []).map((inq) => {
    const v = inq.venues as { name: string; slug: string } | { name: string; slug: string }[] | null;
    const venue = Array.isArray(v) ? v[0] ?? null : v;
    return { ...inq, venues: venue };
  });

  return (
    <div>
      <h2 className="text-h2 text-foreground font-normal mb-6">Inquiries</h2>
      <Suspense
        fallback={
          <div className="space-y-6 animate-pulse">
            <div className="hidden md:flex flex-wrap items-center gap-3">
              <div className="h-4 bg-muted rounded w-14" />
              <div className="h-10 bg-section-alt rounded w-[140px]" />
              <div className="h-10 bg-section-alt rounded w-[140px]" />
              <div className="h-10 bg-section-alt rounded w-[180px]" />
            </div>
            <div className="md:hidden w-full">
              <div className="w-full min-h-[44px] rounded border border-border bg-section-alt" aria-hidden />
            </div>
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <li
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded border border-border bg-section-alt p-4"
                >
                  <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-28" />
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="flex gap-2 border-t border-border pt-2 sm:border-t-0 sm:pt-0 sm:pl-3 sm:border-l">
                    <div className="h-9 bg-section-alt rounded w-20" />
                    <div className="h-9 bg-section-alt rounded w-14" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <InquiriesListWithDrawer inquiries={inquiries} venues={venues ?? []} />
      </Suspense>
    </div>
  );
}
