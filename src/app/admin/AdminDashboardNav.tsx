'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, Users, MessageCircle } from 'lucide-react';

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; match?: 'exact' }[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, match: 'exact' },
  { href: '/admin/venues', label: 'Venues', icon: MapPin },
  { href: '/admin/vendors', label: 'Vendors', icon: Users },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageCircle },
];

export function AdminDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 overflow-x-auto overflow-y-hidden rounded border border-border bg-section-alt/80 p-1.5 shadow-[var(--shadow-soft)] md:overflow-visible" aria-label="Admin sections">
      <div className="flex flex-nowrap gap-1 pb-0.5 md:flex-wrap md:pb-0">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const isActive = match === 'exact' ? pathname === href : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              data-active={isActive}
              className="relative flex shrink-0 items-center gap-2 rounded px-4 py-2.5 min-h-[44px] text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-card hover:text-foreground data-[active=true]:bg-brand data-[active=true]:text-[var(--page-bg)] data-[active=true]:hover:bg-brand-hover data-[active=true]:hover:text-[var(--page-bg)]"
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
