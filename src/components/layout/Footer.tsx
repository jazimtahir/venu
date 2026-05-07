import Link from 'next/link';
import { SITE_NAME, PAKISTAN_CITIES } from '@/utils/constants';

/** Main cities shown in footer; full list available on /venues */
const FOOTER_CITIES = PAKISTAN_CITIES.filter((c) => c !== 'Other').slice(0, 6);

export function Footer() {
  const headingClass = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--page-bg)] mb-3";
  const linkClass = "text-[13px] text-muted-light hover:text-blush transition-colors duration-300 inline-block py-0.5";

  return (
    <footer className="mt-auto bg-ink-soft text-muted-light">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="font-display text-[26px] font-light tracking-[0.12em] text-[var(--page-bg)] hover:text-blush transition-colors duration-300 block mb-4"
            >
              {SITE_NAME}
            </Link>
            <p className="text-[13px] leading-relaxed max-w-[260px] font-light">
              Find your perfect event venue in Pakistan. Compare halls, farmhouses and marquees for weddings and more—all in one place.
            </p>
          </div>

          <div>
            <p className={headingClass}>Venues by city</p>
            <ul className="space-y-0.5">
              {FOOTER_CITIES.map((city) => (
                <li key={city}>
                  <Link href={`/city/${encodeURIComponent(city)}`} className={linkClass}>
                    {city}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/venues" className={linkClass}>
                  All cities →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className={headingClass}>Explore</p>
            <ul className="space-y-0.5">
              <li>
                <Link href="/venues" className={linkClass}>
                  Browse Venues
                </Link>
              </li>
              <li>
                <Link href="/compare" className={linkClass}>
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className={headingClass}>For Vendors</p>
            <ul className="space-y-0.5">
              <li>
                <Link href="/register?vendor=1" className={linkClass}>
                  List Your Venue
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[12px]"
          style={{ borderTop: '1px solid var(--footer-divider)' }}
        >
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <nav className="flex items-center gap-4" aria-label="Legal and support">
            <Link href="/terms" className="text-muted-light hover:text-blush transition-colors duration-300">
              Terms
            </Link>
            <Link href="/privacy" className="text-muted-light hover:text-blush transition-colors duration-300">
              Privacy
            </Link>
            <Link href="/contact" className="text-muted-light hover:text-blush transition-colors duration-300">
              Contact
            </Link>
          </nav>
          <span className="font-display font-normal italic text-brand text-[15px]">
            Made with love, for love.
          </span>
        </div>
      </div>
    </footer>
  );
}
