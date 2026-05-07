import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MapPin, Users, MessageCircle } from 'lucide-react';
import { NavigationEnd } from '@/components/layout/NavigationEnd';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

export default async function AdminPage() {
  const supabase = await createClient();
  const [venuesRes, vendorsRes, inquiriesRes] = await Promise.all([
    supabase.from('venues').select('id', { count: 'exact', head: true }),
    supabase.from('vendors').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
  ]);

  const cards = [
    { href: '/admin/venues', count: venuesRes.count ?? 0, label: 'Venues', icon: MapPin },
    { href: '/admin/vendors', count: vendorsRes.count ?? 0, label: 'Vendors', icon: Users },
    { href: '/admin/inquiries', count: inquiriesRes.count ?? 0, label: 'Inquiries', icon: MessageCircle },
  ];

  return (
    <div>
      <NavigationEnd />
      <RevealOnScroll className="grid gap-6 sm:grid-cols-3">
        {cards.map(({ href, count, label, icon: Icon }, i) => (
          <Link
            key={href}
            href={href}
            className={`reveal ${i === 1 ? 'reveal-delay-1' : i === 2 ? 'reveal-delay-2' : ''} flex items-center gap-4 rounded border border-border bg-section-alt p-6 shadow-[var(--shadow-soft)] transition-all duration-200 hover:shadow-[var(--shadow-card)] hover:border-brand/20 hover:-translate-y-0.5`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-brand/10 text-brand">
              <Icon className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{count}</p>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </RevealOnScroll>
    </div>
  );
}
