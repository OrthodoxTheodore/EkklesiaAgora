export function ScriptureSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8" aria-busy="true" aria-label="Loading scripture">
      <div className="bg-navy-light animate-pulse rounded h-10 w-64 mb-6" />
      <div className="bg-navy-light animate-pulse rounded h-80 w-full mb-4" />
      <div className="bg-navy-light animate-pulse rounded h-6 w-48" />
    </div>
  );
}
