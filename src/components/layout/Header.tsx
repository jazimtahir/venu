import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SITE_NAME } from '@/utils/constants';
import { HeaderNav } from './HeaderNav';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };

  const hasUser = !!user;
  const isVendor = profile?.role === 'vendor';
  const isAdmin = profile?.role === 'admin';

  return (
    <header
      className="sticky top-0 z-50 border-b border-border shadow-[var(--shadow-soft)] backdrop-blur-[16px]"
      style={{ background: 'color-mix(in oklch, var(--page-bg) 88%, transparent)' }}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-8 md:px-12">
        <Link
          href="/"
          className="font-serif text-[26px] font-light tracking-[0.12em] text-foreground no-underline hover:opacity-90 transition-opacity duration-300"
        >
          {SITE_NAME.slice(0, 3)}
          <em className="italic text-brand">{SITE_NAME.slice(3)}</em>
        </Link>
        <HeaderNav hasUser={hasUser} isVendor={isVendor} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
