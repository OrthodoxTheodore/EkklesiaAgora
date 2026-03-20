export function PatristicSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-navy-mid rounded-[6px] h-32"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
