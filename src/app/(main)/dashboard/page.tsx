// Dashboard — protected route, requires authentication
// Server component with auth check implemented in Plan 01-02/01-03
export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-cinzel text-gold text-2xl uppercase tracking-widest mb-4">
        Dashboard
      </h1>
      <p className="font-garamond text-text-mid">
        Dashboard content is implemented in subsequent plans.
        This page is protected by middleware (AUTH-05).
      </p>
    </div>
  );
}
