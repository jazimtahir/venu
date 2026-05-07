export default function VenueSlugLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 animate-pulse">
      {/* Back + actions strip — matches page: back link, then two buttons */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="h-10 rounded py-2 w-32 bg-section-alt" aria-hidden />
        <div className="h-10 w-10 shrink-0 rounded-full bg-section-alt" aria-hidden />
        <div className="h-10 rounded w-24 bg-section-alt" aria-hidden />
      </div>

      {/* Header — title (can be long on desktop), city, rating line */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-9 bg-section-alt rounded w-3/4 max-w-xl mb-0" />
          <div className="h-6 w-16 rounded-full bg-section-alt/80" />
        </div>
        <div className="mt-2 h-5 bg-muted rounded w-48" />
        <div className="mt-2 h-4 bg-muted rounded w-36" />
      </header>

      {/* Gallery — first large (md:col-span-2 md:row-span-2), then grid */}
      <section className="mb-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-section-alt border border-border md:col-span-2 md:row-span-2" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-section-alt border border-border" />
          ))}
        </div>
      </section>

      {/* Two-column content: main (lg:col-span-2) + sticky sidebar — matches desktop layout */}
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
            <div className="h-5 bg-section-alt rounded w-20" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-3">
            <div className="h-5 bg-section-alt rounded w-36" />
            <div className="space-y-4">
              <div className="h-14 rounded-xl border border-border bg-muted/30" />
              <div className="h-14 rounded-xl border border-border bg-muted/30" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-2">
            <div className="h-5 bg-section-alt rounded w-28" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-4/5" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-2">
            <div className="h-5 bg-section-alt rounded w-32" />
            <ul className="space-y-1.5">
              <li className="h-4 bg-muted rounded w-3/4" />
              <li className="h-4 bg-muted rounded w-1/2" />
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="h-5 bg-section-alt rounded w-24 mb-3" />
            <div className="flex flex-wrap gap-2">
              <div className="h-8 bg-muted rounded-full w-20" />
              <div className="h-8 bg-muted rounded-full w-24" />
              <div className="h-8 bg-muted rounded-full w-16" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] space-y-3">
            <div className="h-5 bg-section-alt rounded w-16" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-4/5" />
          </div>
        </div>
        {/* Sidebar — sticky on desktop, card style to match inquiry block */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card-hover)]">
            <div className="h-5 bg-section-alt rounded w-24 mb-3" />
            <div className="h-4 bg-muted rounded w-full mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-muted rounded w-full" />
              <div className="h-10 bg-muted rounded w-full" />
              <div className="h-24 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Similar venues — matches page: mt-20 pt-16 border-t, h2, grid lg:grid-cols-4 */}
      <section className="mt-20 pt-16 border-t border-border">
        <div className="h-8 bg-section-alt rounded w-40 mb-8" aria-hidden />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="overflow-hidden rounded border border-border bg-card shadow-[var(--shadow-card)] animate-pulse">
              <div className="aspect-[3/2] sm:aspect-[4/3] bg-section-alt" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-section-alt rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-20 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
