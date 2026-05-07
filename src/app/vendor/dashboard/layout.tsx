import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Toaster } from 'sonner';
import { VendorDashboardNav } from './VendorDashboardNav';
import { getNewInquiriesCountToday } from '@/app/actions/inquiries';
import { getVendorUnreadCount } from '@/app/actions/notifications';
import { NotificationBell } from './NotificationBell';

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();

  if (profile?.role !== 'vendor' || !vendor) {
    redirect('/dashboard');
  }

  const [newInquiriesCount, notificationUnreadCount] = await Promise.all([
    getNewInquiriesCountToday(),
    getVendorUnreadCount(),
  ]);

  return (
    <div className="min-h-screen bg-section-alt">
      <Toaster position="bottom-center" richColors={false} />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-h1 text-foreground font-normal">Vendor dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your venues and inquiries</p>
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <NotificationBell initialUnreadCount={notificationUnreadCount} />
            <Link
              href="/vendor/dashboard/venues/new"
              className="inline-flex w-full min-h-[44px] flex-1 items-center justify-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-medium text-[var(--page-bg)] shadow-[var(--shadow-soft)] hover:bg-brand-hover transition-all duration-200 hover:-translate-y-px sm:w-auto sm:flex-initial"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add venue
            </Link>
          </div>
        </header>

        <VendorDashboardNav newInquiriesCount={newInquiriesCount} />

        <main className="rounded border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
