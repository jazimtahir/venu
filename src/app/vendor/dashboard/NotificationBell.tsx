'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getVendorNotifications, markNotificationRead } from '@/app/actions/notifications';
import { getCached, setCached, invalidateCached } from '@/lib/client-cache';

const NOTIFICATIONS_CACHE_KEY = 'vendor-notifications';
const NOTIFICATIONS_CACHE_TTL_MS = 45_000; // 45s – skip refetch when reopening dropdown

interface NotificationBellProps {
  initialUnreadCount?: number;
}

type NotificationType = 'new_inquiry' | 'booking_confirmed' | 'event_reminder';

export function NotificationBell({ initialUnreadCount = 0 }: NotificationBellProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<{ id: string; type: NotificationType; title: string; body: string | null; is_read: boolean; related_id: string | null; created_at: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  useEffect(() => {
    if (open) {
      const cached = getCached<{ id: string; type: NotificationType; title: string; body: string | null; is_read: boolean; related_id: string | null; created_at: string }[]>(NOTIFICATIONS_CACHE_KEY);
      if (cached) {
        setNotifications(cached);
        setLoading(false);
        return;
      }
      setLoading(true);
      getVendorNotifications(10).then((res) => {
        if (res.data) {
          setNotifications(res.data);
          setCached(NOTIFICATIONS_CACHE_KEY, res.data, NOTIFICATIONS_CACHE_TTL_MS);
        }
      }).finally(() => setLoading(false));
    } else {
      setNotifications([]);
    }
  }, [open]);

  const handleClick = async (id: string, type: NotificationType) => {
    await markNotificationRead(id);
    invalidateCached(NOTIFICATIONS_CACHE_KEY); // next open will refetch so list is up to date
    setUnreadCount((c) => Math.max(0, c - 1));
    setOpen(false);
    if (type === 'new_inquiry') router.push('/vendor/dashboard/inquiries');
    else router.push('/vendor/dashboard/bookings');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-[var(--page-bg)]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={16}
        className="w-80 max-w-[calc(100vw-2rem)]"
      >
        <div className="p-3 font-medium text-foreground">Notifications</div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground" aria-busy="true">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" aria-hidden />
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <ul className="max-h-[320px] overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n.id, n.type)}
                  className={`w-full px-3 py-2.5 text-left text-sm hover:bg-section-alt transition-colors min-h-[44px] ${!n.is_read ? 'bg-blush/20' : ''}`}
                >
                  <p className="font-medium text-foreground">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-border p-3">
          <Link
            href="/vendor/dashboard/inquiries"
            className="text-xs font-medium text-brand hover:underline"
            onClick={() => setOpen(false)}
          >
            View all
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
