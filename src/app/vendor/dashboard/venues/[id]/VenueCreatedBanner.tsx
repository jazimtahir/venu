'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export function VenueCreatedBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(searchParams.get('created') === '1');

  useEffect(() => {
    if (searchParams.get('created') === '1') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const url = new URL(window.location.href);
      url.searchParams.delete('created');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [router, searchParams]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-lg border border-sage/30 bg-sage/10 p-4 text-foreground"
      aria-live="polite"
    >
      <CheckCircle2 className="h-5 w-5 shrink-0 text-sage" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Venue created</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Add images and more below so your venue stands out. You can come back anytime to edit.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-section-alt hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <span className="sr-only">Dismiss</span>
        <span aria-hidden>×</span>
      </button>
    </div>
  );
}
