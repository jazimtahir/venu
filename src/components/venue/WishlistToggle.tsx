'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { addToWishlist, removeFromWishlist } from '@/app/actions/wishlist';

interface WishlistToggleProps {
  venueId: string;
  initialSaved: boolean;
  variant?: 'card' | 'detail';
}

export function WishlistToggle({ venueId, initialSaved, variant = 'card' }: WishlistToggleProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      const { error } = await removeFromWishlist(venueId);
      if (!error) setSaved(false);
    } else {
      const { error } = await addToWishlist(venueId);
      if (error) {
        if (error.includes('Sign in')) router.push('/login?redirect=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/venues'));
        return;
      }
      setSaved(true);
    }
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card/95 shadow-[var(--shadow-soft)] backdrop-blur-sm transition-colors hover:bg-card ${saved ? 'text-brand' : 'text-muted-foreground hover:text-foreground'}`}
        title={saved ? 'Saved' : 'Save venue'}
        aria-label={saved ? 'Remove from saved' : 'Save venue'}
      >
        <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex min-h-[44px] items-center gap-2 rounded border border-border bg-section-alt px-4 py-2 text-sm font-medium transition-colors hover:bg-muted ${saved ? 'text-brand border-brand/30' : 'text-foreground'}`}
      title={saved ? 'Saved' : 'Save venue'}
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden />
      {saved ? 'Saved' : 'Save venue'}
    </button>
  );
}
