/** Skeleton shown while dashboard segment loads. Keeps main area filled so footer stays at bottom. */
export default function DashboardLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col animate-pulse">
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <div className="h-9 w-40 rounded bg-muted" />
        <div className="mt-2 h-5 w-56 rounded bg-muted" />
        <div className="mt-8 rounded border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
          <div className="h-6 w-16 rounded bg-muted" />
          <div className="mt-4 space-y-2">
            <div className="h-4 max-w-xs rounded bg-muted" />
            <div className="h-4 max-w-sm rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        </div>
        <div className="mt-8">
          <div className="mb-3 h-6 w-28 rounded bg-muted" />
          <div className="rounded border border-border bg-card p-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
