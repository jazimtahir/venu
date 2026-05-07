import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Toaster } from 'sonner';
import { AdminDashboardNav } from './AdminDashboardNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-section-alt">
      <Toaster position="bottom-center" richColors={false} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-h1 text-foreground font-normal">Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage venues, vendors, and inquiries</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex w-full min-h-[44px] flex-1 items-center justify-center gap-2 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-card transition-colors duration-200 sm:w-auto sm:flex-initial"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Dashboard
          </Link>
        </header>

        <AdminDashboardNav />

        <main className="rounded border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
