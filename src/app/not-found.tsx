import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <p className="font-cinzel-dec text-gold text-6xl md:text-7xl mb-4">404</p>

      <div className="flex items-center justify-center gap-4 mb-6 w-full max-w-xs">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
        <div className="w-2 h-2 rounded-full bg-gold/40" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
      </div>

      <h1 className="font-cinzel text-text-light text-lg uppercase tracking-widest mb-3">
        This page could not be found
      </h1>
      <p className="font-garamond text-text-mid text-base max-w-md mb-8">
        The page you&apos;re looking for may have been moved or no longer exists.
      </p>

      <Link
        href="/"
        className="inline-block px-8 py-3 font-cinzel text-sm uppercase tracking-widest text-navy bg-gold rounded hover:bg-gold-bright transition-colors shadow-lg"
      >
        Return Home
      </Link>
    </div>
  );
}
