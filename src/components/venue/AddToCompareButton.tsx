'use client';

import { useRouter } from 'next/navigation';
import { GitCompare } from 'lucide-react';
import { COMPARE_COOKIE_NAME, COMPARE_MAX_VENUES, parseCompareIds, serializeCompareIds } from '@/lib/compare';

function getCompareIds(): string[] {
  if (typeof document === 'undefined') return [];
  const match = document.cookie.match(new RegExp(`(?:^|; )\\s*${COMPARE_COOKIE_NAME}=([^;]*)`));
  return parseCompareIds(match ? decodeURIComponent(match[1]) : '');
}

function setCompareCookie(ids: string[]) {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(serializeCompareIds(ids));
  document.cookie = `${COMPARE_COOKIE_NAME}=${value}; path=/; max-age=2592000; samesite=lax`;
}

interface AddToCompareButtonProps {
  venueId: string;
  variant?: 'card' | 'detail';
  onAdded?: () => void;
}

export function AddToCompareButton({ venueId, variant = 'card', onAdded }: AddToCompareButtonProps) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ids = getCompareIds();
    if (ids.includes(venueId)) {
      router.push(`/compare?${ids.map((id) => `ids=${encodeURIComponent(id)}`).join('&')}`);
      return;
    }
    const next = [...ids, venueId].slice(-COMPARE_MAX_VENUES);
    setCompareCookie(next);
    onAdded?.();
    router.push(`/compare?${next.map((id) => `ids=${encodeURIComponent(id)}`).join('&')}`);
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded bg-card/95 px-2.5 py-1.5 text-[10px] font-medium text-foreground shadow-[var(--shadow-soft)] backdrop-blur-sm hover:bg-card transition-colors"
        title="Add to compare"
        aria-label="Add to compare"
      >
        <GitCompare className="h-3.5 w-3.5" aria-hidden />
        Compare
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded border border-border bg-section-alt px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      title="Add to compare"
    >
      <GitCompare className="h-4 w-4" aria-hidden />
      Add to compare
    </button>
  );
}
