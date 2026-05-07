/** Skeleton for Edit profile page. Matches profile page layout: max-w-md, title, form fields. */
export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-10 animate-pulse">
      <div className="h-8 bg-section-alt rounded w-32 mb-6" aria-hidden />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-11 bg-section-alt rounded w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-12" />
          <div className="h-11 bg-section-alt rounded w-full" />
        </div>
        <div className="pt-2">
          <div className="h-11 bg-section-alt rounded w-24" />
        </div>
      </div>
    </div>
  );
}
