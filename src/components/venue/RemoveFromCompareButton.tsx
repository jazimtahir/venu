'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { COMPARE_COOKIE_NAME, serializeCompareIds } from '@/lib/compare';

function setCompareCookie(ids: string[]) {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(serializeCompareIds(ids));
  document.cookie = `${COMPARE_COOKIE_NAME}=${value}; path=/; max-age=2592000; samesite=lax`;
}

interface RemoveFromCompareButtonProps {
  venueId: string;
  allIds: string[];
}

export function RemoveFromCompareButton({ venueId, allIds }: RemoveFromCompareButtonProps) {
  const router = useRouter();
  const next = allIds.filter((id) => id !== venueId);
  const search = next.length ? `?${next.map((id) => `ids=${encodeURIComponent(id)}`).join('&')}` : '';

  function handleClick() {
    setCompareCookie(next);
    router.push(`/compare${search}`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      title="Remove from compare"
      aria-label="Remove from compare"
    >
      <X className="h-4 w-4" aria-hidden />
    </button>
  );
}
