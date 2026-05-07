'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] text-center">
        <span
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive"
          aria-hidden
        >
          <AlertCircle className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-h2 text-foreground font-normal">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          We encountered an error. Please try again.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[44px] items-center justify-center rounded bg-brand px-5 py-2.5 text-sm font-medium text-[var(--page-bg)] shadow-[var(--shadow-soft)] hover:bg-brand-hover transition-all duration-200"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-card transition-all duration-200"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
