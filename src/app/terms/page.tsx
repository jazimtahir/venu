import Link from 'next/link';
import { SITE_NAME } from '@/utils/constants';

export const metadata = {
  title: 'Terms of Service',
  description: `Terms of Service for ${SITE_NAME} – Event venue marketplace in Pakistan.`,
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:px-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10">
        <h1 className="text-h1 text-foreground font-normal">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="mt-8 space-y-6 text-foreground text-[15px] leading-relaxed">
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">1. Acceptance of terms</h2>
            <p className="text-muted-foreground">
              By accessing or using {SITE_NAME} (&quot;the platform&quot;), you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the platform.
            </p>
          </section>
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">2. Use of the platform</h2>
            <p className="text-muted-foreground">
              {SITE_NAME} is an event venue marketplace for Pakistan. You may browse venues, submit inquiries, and—if you
              register as a vendor—list and manage venues. You must provide accurate information and use the platform
              only for lawful purposes.
            </p>
          </section>
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">3. Accounts and roles</h2>
            <p className="text-muted-foreground">
              Customers, vendors, and administrators have different access levels. You are responsible for keeping your
              account credentials secure. Vendors are responsible for the accuracy of venue listings and for fulfilling
              inquiries and bookings.
            </p>
          </section>
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">4. Content and conduct</h2>
            <p className="text-muted-foreground">
              You must not post false, misleading, or offensive content. We may remove content or suspend accounts that
              violate these terms or applicable law.
            </p>
          </section>
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">5. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, please see our <Link href="/contact" className="font-medium text-brand hover:underline underline-offset-2">Contact</Link> page.
            </p>
          </section>
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
