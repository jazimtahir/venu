'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, MessageCircle, CalendarDays, Calendar } from 'lucide-react';

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; badge?: 'inquiries'; match?: 'exact' }[] = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: 'exact' },
  { href: '/vendor/dashboard/venues', label: 'My venues', icon: MapPin },
  { href: '/vendor/dashboard/inquiries', label: 'Inquiries', icon: MessageCircle, badge: 'inquiries' },
  { href: '/vendor/dashboard/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/vendor/dashboard/calendar', label: 'Calendar', icon: Calendar },
];

interface VendorDashboardNavProps {
  newInquiriesCount?: number;
}

export function VendorDashboardNav({ newInquiriesCount = 0 }: VendorDashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mb-8 overflow-x-auto overflow-y-hidden rounded border border-border bg-section-alt/80 p-1.5 shadow-[var(--shadow-soft)] md:overflow-visible" aria-label="Dashboard sections">
      <div className="flex flex-nowrap gap-1 pb-0.5 md:flex-wrap md:pb-0">
        {navItems.map(({ href, label, icon: Icon, badge, match }) => {
          const isActive = match === 'exact' ? pathname === href : pathname === href || pathname.startsWith(href + '/');
          const showBadge = badge === 'inquiries' && newInquiriesCount > 0;
          return (
            <Link
              key={href}
              href={href}
              data-active={isActive}
              className="relative flex shrink-0 items-center gap-2 rounded px-4 py-2.5 min-h-[44px] text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-card hover:text-foreground data-[active=true]:bg-brand data-[active=true]:text-[var(--page-bg)] data-[active=true]:hover:bg-brand-hover data-[active=true]:hover:text-[var(--page-bg)]"
            >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
            {showBadge && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blush px-1.5 text-xs font-semibold text-ink">
                {newInquiriesCount > 99 ? '99+' : newInquiriesCount}
              </span>
            )}
          </Link>
          );
        })}
      </div>
    </nav>
  );
}
