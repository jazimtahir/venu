export function MainContentLoader() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[40vh]" aria-hidden>
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 rounded-full border-2 border-brand border-t-transparent animate-spin"
          role="presentation"
        />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
