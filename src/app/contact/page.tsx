import Link from 'next/link';
import { SITE_NAME } from '@/utils/constants';
import { Mail } from 'lucide-react';

export const metadata = {
  title: 'Contact',
  description: `Contact ${SITE_NAME} – Get in touch for support or general inquiries.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:px-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10">
        <h1 className="text-h1 text-foreground font-normal">Contact us</h1>
        <p className="mt-2 text-muted-foreground">
          Have a question, feedback, or need support? We&apos;re here to help.
        </p>
        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-4 rounded-xl border border-border bg-section-alt p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand" aria-hidden>
              <Mail className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-h3 text-foreground font-medium">Email</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                For general inquiries and support, email us at:
              </p>
              <a
                href="mailto:support@venue.com"
                className="mt-2 inline-block font-medium text-brand hover:underline underline-offset-2"
              >
                support@venue.com
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Replace with your actual support email. We typically respond within 1–2 business days.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Looking for a venue? Use our <Link href="/" className="font-medium text-brand hover:underline underline-offset-2">homepage</Link> to browse
            or request a callback. Vendors can <Link href="/register?vendor=1" className="font-medium text-brand hover:underline underline-offset-2">register here</Link> to list a venue.
          </p>
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-brand hover:underline underline-offset-2">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
