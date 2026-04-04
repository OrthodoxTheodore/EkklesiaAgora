export function CalendarSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading calendar" className="space-y-4">
      {/* Toggle + header skeleton */}
      <div className="flex gap-2">
        <div className="bg-navy-light animate-pulse rounded h-8 w-32" />
        <div className="bg-navy-light animate-pulse rounded h-8 w-36" />
      </div>
      <div className="flex items-center justify-between">
        <div className="bg-navy-light animate-pulse rounded h-8 w-8" />
        <div className="bg-navy-light animate-pulse rounded h-8 w-48" />
        <div className="bg-navy-light animate-pulse rounded h-8 w-8" />
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-navy-light animate-pulse rounded h-5" />
        ))}
      </div>

      {/* Calendar grid — 5 rows × 7 cols */}
      <div className="grid grid-cols-7 gap-px bg-navy-light rounded-lg overflow-hidden">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="bg-navy animate-pulse min-h-[80px] sm:min-h-[100px]" />
        ))}
      </div>
    </div>
  );
}
