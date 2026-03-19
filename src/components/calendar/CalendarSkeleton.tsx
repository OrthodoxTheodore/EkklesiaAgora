export function CalendarSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading calendar" className="space-y-4">
      {/* Feast section skeleton */}
      <div className="bg-navy-light animate-pulse rounded h-24 w-full" />
      {/* Saints section skeleton */}
      <div className="bg-navy-light animate-pulse rounded h-16 w-full" />
      {/* Readings section skeleton */}
      <div className="bg-navy-light animate-pulse rounded h-10 w-full" />
    </div>
  );
}
