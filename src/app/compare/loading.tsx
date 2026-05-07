export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 animate-pulse">
      <div className="h-9 bg-section-alt rounded w-48 mb-2" aria-hidden />
      <div className="h-5 bg-muted rounded max-w-md mb-8" aria-hidden />
      <div className="-mx-4 sm:mx-0 overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <p className="sm:hidden px-4 pt-2 text-xs text-muted-foreground">Scroll horizontally to compare</p>
        <table className="w-full border-collapse text-left text-sm min-w-[400px]">
          <thead>
            <tr className="border-b border-border bg-muted/80">
              <th className="p-4 w-24">
                <div className="h-4 bg-section-alt rounded w-16" />
              </th>
              <th className="p-4 max-w-[200px]">
                <div className="h-4 bg-section-alt rounded w-24" />
              </th>
              <th className="p-4 max-w-[200px]">
                <div className="h-4 bg-section-alt rounded w-20" />
              </th>
              <th className="p-4 max-w-[200px]">
                <div className="h-4 bg-section-alt rounded w-28" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-border">
                <td className="p-4">
                  <div className="h-4 bg-muted rounded w-20" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-muted rounded w-full max-w-[120px]" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-muted rounded w-full max-w-[100px]" />
                </td>
                <td className="p-4">
                  <div className="h-4 bg-muted rounded w-full max-w-[80px]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
