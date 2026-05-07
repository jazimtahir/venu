import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NavigationEnd } from '@/components/layout/NavigationEnd';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { InquiriesList } from './InquiriesList';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, phone')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') redirect('/admin');
  if (profile?.role === 'vendor') redirect('/vendor/dashboard');

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <NavigationEnd />
      <h1 className="text-h1 text-foreground font-normal">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}.
      </p>
      <RevealOnScroll>
        <div className="reveal mt-8 rounded border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
          <h2 className="text-h4 text-foreground">Profile</h2>
          <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
            <div><dt className="inline font-medium text-foreground">Email </dt><dd className="inline">{user.email}</dd></div>
            {profile?.full_name && <div><dt className="inline font-medium text-foreground">Name </dt><dd className="inline">{profile.full_name}</dd></div>}
            {profile?.phone && <div><dt className="inline font-medium text-foreground">Phone </dt><dd className="inline">{profile.phone}</dd></div>}
          </dl>
          <Link href="/dashboard/profile" className="mt-3 inline-block text-sm font-medium text-brand hover:underline underline-offset-2">
            Edit profile
          </Link>
        </div>

        <div className="reveal reveal-delay-1 mt-8">
          <h2 className="text-h4 text-foreground mb-3">My inquiries</h2>
          <InquiriesList userId={user.id} />
        </div>
      </RevealOnScroll>
    </div>
  );
}
