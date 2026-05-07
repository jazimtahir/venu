import Link from 'next/link';
import { SITE_NAME } from '@/utils/constants';

export const metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${SITE_NAME} – How we collect and use your data.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:px-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10">
        <h1 className="text-h1 text-foreground font-normal">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="mt-8 space-y-6 text-foreground text-[15px] leading-relaxed">
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">1. Information we collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide when registering (name, email, phone), when submitting inquiries
              (name, phone, event date, message), and when listing venues (business and venue details). We also
              collect technical data such as IP address and usage via cookies where applicable.
            </p>
          </section>
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">2. How we use it</h2>
            <p className="text-muted-foreground">
              We use your information to operate the platform, match inquiries to venues, send notifications and
              (if configured) emails, improve our services, and comply with legal obligations.
            </p>
          </section>
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">3. Sharing</h2>
            <p className="text-muted-foreground">
              Inquiry details are shared with the relevant venue vendor so they can respond. We do not sell your
              personal data. We may share data with service providers (e.g. hosting, email) under strict
              confidentiality.
            </p>
          </section>
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">4. Security and retention</h2>
            <p className="text-muted-foreground">
              We use industry-standard measures to protect your data. We retain data as long as needed to provide
              the service and as required by law.
            </p>
          </section>
          <section>
            <h2 className="text-h3 text-foreground font-medium mb-2">5. Your rights and contact</h2>
            <p className="text-muted-foreground">
              You may request access, correction, or deletion of your data where permitted by law. For requests or
              questions, please use our <Link href="/contact" className="font-medium text-brand hover:underline underline-offset-2">Contact</Link> page.
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
