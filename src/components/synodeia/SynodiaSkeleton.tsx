export function SynodiaSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading members"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-4 flex items-center gap-4"
        >
          {/* Avatar skeleton */}
          <div className="w-12 h-12 rounded-full bg-navy-light animate-pulse shrink-0" />
          {/* Text skeletons */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="h-4 bg-navy-light animate-pulse rounded w-3/4" />
            <div className="h-3 bg-navy-light animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
