import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getVenueRatings } from '@/lib/venues';
import { getVenueAvailabilityStatusBatch } from '@/lib/availability';
import { getWishlistVenueIds } from '@/app/actions/wishlist';
import { SearchBar } from '@/components/layout/SearchBar';
import { VenueCard } from '@/components/venue/VenueCard';
import { Button } from '@/components/ui/button';

const CallbackForm = dynamic(
  () => import('@/components/venue/CallbackForm').then((m) => ({ default: m.CallbackForm })),
  {
    loading: () => (
      <div className="rounded-2xl border border-border bg-section-alt p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-40 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-10 bg-muted rounded w-full" />
        </div>
      </div>
    ),
  }
);
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { MapPin, Building2, Heart, Star, Building, TreePine, Home, Tent } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: featuredRaw }, { count: venueCount }, { data: citiesData }] = await Promise.all([
    supabase
      .from('venues')
      .select(`*, venue_images ( image_url )`)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('venues').select('city').limit(500),
  ]);
  const cityCount = new Set((citiesData ?? []).map((r) => r.city)).size;
  const featuredVenues = featuredRaw ?? [];
  const [ratings, availabilityStatuses, wishlistVenueIds] = await Promise.all([
    getVenueRatings(supabase, featuredVenues.map((v) => v.id)),
    getVenueAvailabilityStatusBatch(featuredVenues.map((v) => v.id)),
    getWishlistVenueIds(),
  ]);
  const wishlistSet = new Set(wishlistVenueIds);
  const featuredVenuesWithRatings = featuredVenues.map((v) => ({
    ...v,
    rating: ratings[v.id],
    availabilityStatus: availabilityStatuses[v.id],
  }));

  return (
    <div>
      {/* Hero — background image, overlay, font-display, motion */}
      <section className="relative min-h-[min(28rem,85vh)] sm:min-h-[32rem] flex flex-col items-center justify-center px-4 pt-16 pb-20 sm:pt-20 sm:pb-24 md:pt-28 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/home/hero-rooftop.png"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-ink/85 via-ink/60 to-ink" aria-hidden />
        <div className="absolute inset-0 z-[2] hero-pattern opacity-30" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-brand mb-4 opacity-0 animate-hero-fade-in flex items-center justify-center gap-3">
            <span className="block w-8 h-px bg-brand" aria-hidden />
            Pakistan&apos;s Premier Event Venue Marketplace
          </p>
          <h1 className="text-display text-[var(--page-bg)] opacity-0 animate-hero-fade-in animate-hero-fade-in-delay-1 font-normal">
            Find Your <em className="font-normal text-blush">Perfect</em>
            <span className="block text-[var(--card)]">Event Venue</span>
          </h1>
          <p className="mt-6 text-lg text-muted-light max-w-2xl mx-auto leading-relaxed font-light opacity-0 animate-hero-fade-in animate-hero-fade-in-delay-2">
            Browse and compare the best event venues—from weddings to corporate events—across Lahore, Karachi, Islamabad and beyond.
          </p>
          <div className="mt-12 flex justify-center opacity-0 animate-hero-fade-in animate-hero-fade-in-delay-3">
            <SearchBar />
          </div>
          <p className="mt-4 text-xs uppercase tracking-wider text-muted-light opacity-0 animate-hero-fade-in animate-hero-fade-in-delay-4">Quick links</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 opacity-0 animate-hero-fade-in animate-hero-fade-in-delay-5">
            <Link
              href="/venues?city=Lahore"
              className="rounded-full border border-[var(--card)]/30 bg-[var(--card)]/10 px-4 py-2.5 min-h-[44px] inline-flex items-center text-sm text-[var(--page-bg)] hover:bg-[var(--card)]/20 transition-all duration-200 backdrop-blur-sm"
            >
              Lahore
            </Link>
            <Link
              href="/venues?city=Karachi"
              className="rounded-full border border-[var(--card)]/30 bg-[var(--card)]/10 px-4 py-2.5 min-h-[44px] inline-flex items-center text-sm text-[var(--page-bg)] hover:bg-[var(--card)]/20 transition-all duration-200 backdrop-blur-sm"
            >
              Karachi
            </Link>
            <Link
              href="/venues?venue_type=farmhouse"
              className="rounded-full border border-[var(--card)]/30 bg-[var(--card)]/10 px-4 py-2.5 min-h-[44px] inline-flex items-center text-sm text-[var(--page-bg)] hover:bg-[var(--card)]/20 transition-all duration-200 backdrop-blur-sm"
            >
              Farmhouse
            </Link>
            <Link
              href="/venues?max_price=1000000"
              className="rounded-full border border-[var(--card)]/30 bg-[var(--card)]/10 px-4 py-2.5 min-h-[44px] inline-flex items-center text-sm text-[var(--page-bg)] hover:bg-[var(--card)]/20 transition-all duration-200 backdrop-blur-sm"
            >
              Under 1M PKR
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip — reference: blush icons, dividers, reveal */}
      <RevealOnScroll>
        <section className="bg-section-alt border-y border-border py-7">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="reveal flex items-center gap-3 text-[13px] text-muted tracking-[0.02em]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush text-foreground" aria-hidden>
                <Building2 className="h-4 w-4" />
              </span>
              <span><strong className="text-foreground">{venueCount ?? 0}+</strong> venues</span>
            </div>
            <div className="hidden sm:block w-px h-7 bg-border" aria-hidden />
            <div className="reveal reveal-delay-1 flex items-center gap-3 text-[13px] text-muted tracking-[0.02em]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush text-foreground" aria-hidden>
                <MapPin className="h-4 w-4" />
              </span>
              <span><strong className="text-foreground">{cityCount}</strong> cities</span>
            </div>
            <div className="hidden sm:block w-px h-7 bg-border" aria-hidden />
            <div className="reveal reveal-delay-2 flex items-center gap-3 text-[13px] text-muted tracking-[0.02em]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush text-foreground" aria-hidden>
                <Heart className="h-4 w-4" />
              </span>
              <span><strong className="text-foreground">500+</strong> couples trusted us</span>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* Browse by type — section label, serif title, token tints, reveal */}
      <RevealOnScroll>
        <section className="bg-card py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
            <p className="reveal text-[11px] uppercase tracking-[0.25em] text-brand mb-4">Browse by style</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
              <h2 className="reveal text-h2 text-foreground font-normal">
                Every love story
                <br />
                <em className="text-brand">deserves its own stage</em>
              </h2>
              <Link
                href="/venues"
                className="reveal reveal-delay-1 text-[12px] uppercase tracking-[0.1em] text-muted hover:text-brand transition-colors duration-300 flex items-center gap-2 shrink-0"
              >
                View all categories
                <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {([
                { value: 'indoor', label: 'Indoor', icon: Building, tint: 'bg-blush/30' },
                { value: 'outdoor', label: 'Outdoor', icon: TreePine, tint: 'bg-sage/20' },
                { value: 'farmhouse', label: 'Farmhouse', icon: Home, tint: 'bg-champagne/20' },
                { value: 'marquee', label: 'Marquee', icon: Tent, tint: 'bg-blush/20' },
              ] as const).map(({ value, label, icon: Icon, tint }, i) => (
                <Link
                  key={value}
                  href={`/venues?venue_type=${value}`}
                  className={`reveal ${i === 1 ? 'reveal-delay-1' : i === 2 ? 'reveal-delay-2' : i === 3 ? 'reveal-delay-3' : ''} group flex flex-col items-center justify-center rounded border-border border bg-section-alt px-6 py-10 text-center transition-all duration-300 hover:border-brand/30 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5`}
                >
                  <span className={`inline-flex items-center justify-center w-12 h-12 rounded ${tint} mb-3 transition-colors group-hover:bg-brand/10`}>
                    <Icon className="h-6 w-6 text-brand" aria-hidden />
                  </span>
                  <span className="text-h4 text-foreground group-hover:text-brand transition-colors font-normal">
                    {label}
                  </span>
                  <span className="mt-1 text-sm text-muted-foreground group-hover:text-brand/80">View venues →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* Wedding moments — gallery of 4 images */}
      <RevealOnScroll>
        <section className="bg-card py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
            <p className="reveal text-[11px] uppercase tracking-[0.25em] text-brand mb-4">Wedding moments</p>
            <h2 className="reveal text-h2 text-foreground font-normal mb-12">
              Celebrate in <em className="text-brand">style</em>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="reveal relative aspect-[4/3] overflow-hidden rounded border border-border bg-card shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)]">
                <Image
                  src="/home/gallery-outdoor-ceremony.png"
                  alt="Outdoor wedding ceremony under floral arch with lawn and white chairs"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className="reveal reveal-delay-1 relative aspect-[4/3] overflow-hidden rounded border border-border bg-card shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)]">
                <Image
                  src="/home/gallery-indoor-hall.png"
                  alt="Grand indoor reception with chandeliers and round tables"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className="reveal reveal-delay-2 relative aspect-[4/3] overflow-hidden rounded border border-border bg-card shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)]">
                <Image
                  src="/home/gallery-ballroom-couple.png"
                  alt="Bride and groom in opulent ballroom with drapes and florals"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className="reveal reveal-delay-3 relative aspect-[4/3] overflow-hidden rounded border border-border bg-card shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)]">
                <Image
                  src="/home/gallery-rose-garden.png"
                  alt="Couple in rose garden with floral arch and stone bench"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* Featured venues — section label, reveal grid */}
      <section className="bg-section-alt py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-brand mb-2">Handpicked for you</p>
              <h2 className="text-h2 text-foreground font-normal">Featured <em className="text-brand">venues</em></h2>
            </div>
            <Button variant="outline" size="default" asChild>
              <Link href="/venues" className="shrink-0 text-[12px] uppercase tracking-[0.1em]">
                Browse all venues
                <span aria-hidden>→</span>
              </Link>
            </Button>
          </div>
          {featuredVenuesWithRatings.length > 0 ? (
            <RevealOnScroll className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredVenuesWithRatings.map((venue, i) => (
                <div
                  key={venue.id}
                  className={`reveal ${i === 1 ? 'reveal-delay-1' : i === 2 ? 'reveal-delay-2' : i >= 3 ? 'reveal-delay-3' : ''}`}
                >
                  <VenueCard venue={venue} availabilityStatus={venue.availabilityStatus} wishlistSaved={wishlistSet.has(venue.id)} impressionSource="homepage" />
                </div>
              ))}
            </RevealOnScroll>
          ) : (
            <div className="rounded border border-border bg-card px-8 py-16 text-center shadow-[var(--shadow-soft)]">
              <p className="text-muted-foreground">
                No featured venues yet. Check back soon or{' '}
                <Link href="/venues" className="font-medium text-brand hover:underline underline-offset-2">
                  browse all venues
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials — section label, quote mark, Cormorant italic, avatar, featured border, reveal */}
      <RevealOnScroll>
        <section className="bg-section-alt py-12 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
            <p className="reveal text-[11px] uppercase tracking-[0.25em] text-brand text-center mb-2">Couples love us</p>
            <h2 className="reveal text-h2 text-foreground text-center font-normal mb-12">
              Stories from <em className="text-brand">happy couples</em>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <blockquote className="reveal rounded border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)] relative">
                <span className="font-display text-[40px] sm:text-[52px] leading-none text-blush absolute top-4 right-5 sm:top-5 sm:right-7 font-light" aria-hidden>&ldquo;</span>
                <p className="font-serif text-lg italic text-ink-soft leading-relaxed mb-7 font-light">
                  We found our dream farmhouse in Lahore through Venue. The process was smooth and we got responses within a day.
                </p>
                <footer className="flex items-center gap-3">
                  <span className="h-11 w-11 shrink-0 rounded-full bg-blush/80" style={{ background: 'linear-gradient(135deg, var(--blush), var(--champagne))' }} aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">Ayesha &amp; Hassan</p>
                    <p className="text-xs text-muted">Lahore</p>
                  </div>
                </footer>
              </blockquote>
              <blockquote className="reveal reveal-delay-1 rounded border-2 border-blush bg-card p-6 sm:p-8 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)] relative">
                <span className="font-display text-[40px] sm:text-[52px] leading-none text-blush absolute top-4 right-5 sm:top-5 sm:right-7 font-light" aria-hidden>&ldquo;</span>
                <p className="font-serif text-lg italic text-ink-soft leading-relaxed mb-7 font-light">
                  Comparing venues by budget and capacity saved us so much time. We booked a beautiful hall in Karachi.
                </p>
                <footer className="flex items-center gap-3">
                  <span className="h-11 w-11 shrink-0 rounded-full opacity-90" style={{ background: 'linear-gradient(135deg, var(--sage), var(--sage))' }} aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">Fatima &amp; Omar</p>
                    <p className="text-xs text-muted">Karachi</p>
                  </div>
                </footer>
              </blockquote>
              <blockquote className="reveal reveal-delay-2 rounded border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)] relative sm:col-span-2 lg:col-span-1">
                <span className="font-display text-[40px] sm:text-[52px] leading-none text-blush absolute top-4 right-5 sm:top-5 sm:right-7 font-light" aria-hidden>&ldquo;</span>
                <p className="font-serif text-lg italic text-ink-soft leading-relaxed mb-7 font-light">
                  The team helped us narrow down options. Our marquee event in Islamabad was perfect.
                </p>
                <footer className="flex items-center gap-3">
                  <span className="h-11 w-11 shrink-0 rounded-full opacity-90" style={{ background: 'linear-gradient(135deg, var(--champagne), var(--blush-deep))' }} aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">Zainab &amp; Ali</p>
                    <p className="text-xs text-muted">Islamabad</p>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* Callback — token-only card */}
      <section className="bg-section-alt border-t border-border py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12">
          <div className="mx-auto max-w-xl rounded border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <h2 className="text-h2 text-foreground mb-2 font-normal">Need help finding a venue?</h2>
            <p className="text-muted mb-6">
              Tell us your number and city. We&apos;ll call you to understand your requirements and suggest the best options.
            </p>
            <CallbackForm />
          </div>
        </div>
      </section>

      {/* Editorial CTA — full-width dark (ink), rose label, cream title, primary + ghost */}
      <section className="bg-ink text-[var(--page-bg)] py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-brand flex items-center gap-3 mb-6">
              <span className="block w-7 h-px bg-brand" aria-hidden />
              For venue owners
            </p>
            <h2 className="text-h2 font-normal text-[var(--page-bg)] mb-6">
              Reach couples
              <br />
              who are <em className="text-blush">ready</em>
              <br />
              to say yes
            </h2>
            <p className="text-[15px] text-muted-light font-light leading-relaxed max-w-[380px] mb-10">
              Join our marketplace and reach thousands of people planning their next event. Your next booking could be one enquiry away.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-sm uppercase tracking-[0.1em] text-xs">
                <Link href="/register?vendor=1">List your venue</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="rounded-sm border-[var(--card)]/50 bg-transparent text-[var(--page-bg)] hover:bg-[var(--card)]/10 hover:border-blush hover:text-blush uppercase tracking-[0.1em] text-xs">
                <Link href="/venues">Learn more</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] min-h-[200px] rounded overflow-hidden bg-ink-soft">
            <Image
              src="/home/cta-heritage-venue.png"
              alt="Elegant wedding venue and heritage setting"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-start p-4 sm:p-6">
              <div className="rounded bg-card p-4 sm:p-6 shadow-[var(--shadow-elevated)] w-full max-w-[260px]">
                <p className="font-display text-base font-normal text-foreground mb-2">Average 34 enquiries/month</p>
                <p className="text-[12px] text-muted leading-relaxed">
                  Venues on our platform receive a consistent flow of qualified couple enquiries year-round.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
