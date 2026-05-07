import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] text-center">
        <span
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-hidden
        >
          <FileQuestion className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-h2 text-foreground font-normal">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded bg-brand px-5 py-2.5 text-sm font-medium text-[var(--page-bg)] shadow-[var(--shadow-soft)] hover:bg-brand-hover transition-all duration-200"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
