export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Title skeleton */}
      <div className="mb-8 space-y-3 text-center">
        <div className="mx-auto h-9 w-72 animate-pulse rounded bg-orange-100" />
        <div className="mx-auto h-5 w-56 animate-pulse rounded bg-orange-50" />
      </div>

      {/* Category pills skeleton */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-full bg-orange-50"
          />
        ))}
      </div>

      {/* Business card grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--color-border)] bg-white p-5 space-y-3"
          >
            <div className="h-5 w-3/4 animate-pulse rounded bg-orange-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-orange-50" />
            <div className="h-4 w-full animate-pulse rounded bg-orange-50" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className="h-4 w-4 animate-pulse rounded bg-orange-100"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
