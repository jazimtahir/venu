import Link from 'next/link';
import { SITE_NAME } from '@/utils/constants';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-section-alt px-4 py-12 hero-pattern">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-brand/10 pointer-events-none" aria-hidden />
      <Link href="/" className="relative font-display text-xl font-light tracking-[0.12em] text-foreground hover:text-brand transition-colors duration-300 mb-6">
        {SITE_NAME}
      </Link>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
