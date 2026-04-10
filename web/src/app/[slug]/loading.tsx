export default function BusinessDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Back link skeleton */}
      <div className="mb-6 h-4 w-28 animate-pulse rounded bg-orange-100" />

      {/* Business header skeleton */}
      <div className="space-y-3 mb-8">
        <div className="h-8 w-2/3 animate-pulse rounded bg-orange-100" />
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-orange-50" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-orange-50" />
        </div>
        <div className="h-4 w-full animate-pulse rounded bg-orange-50" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-orange-50" />
      </div>

      {/* Contact / details skeleton */}
      <div className="rounded-lg border border-[var(--color-border)] bg-white p-5 mb-8 space-y-3">
        <div className="h-5 w-40 animate-pulse rounded bg-orange-100" />
        <div className="h-4 w-56 animate-pulse rounded bg-orange-50" />
        <div className="h-4 w-48 animate-pulse rounded bg-orange-50" />
      </div>

      {/* Reviews section skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-orange-100" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--color-border)] bg-white p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-orange-100" />
              <div className="h-4 w-28 animate-pulse rounded bg-orange-100" />
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className="h-4 w-4 animate-pulse rounded bg-orange-100"
                />
              ))}
            </div>
            <div className="h-4 w-full animate-pulse rounded bg-orange-50" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-orange-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
