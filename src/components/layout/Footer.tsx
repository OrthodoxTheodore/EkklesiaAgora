import Link from 'next/link';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/agora', label: 'Agora' },
  { href: '/videos', label: 'Videos' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/synodeia', label: 'Synodeia' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gold/10 bg-navy-mid">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row md:justify-between gap-8">
        <div className="max-w-xs">
          <Link href="/" className="font-cinzel-dec text-gold text-lg tracking-wider">
            Ekklesia Agora
          </Link>
          <p className="font-garamond text-text-mid text-sm mt-2">
            A gathering place for the Eastern Orthodox community.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 content-start" aria-label="Footer navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-cinzel text-xs uppercase tracking-widest text-text-mid hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div>
          <p className="font-cinzel text-xs uppercase tracking-widest text-gold-dim mb-2">
            Contact
          </p>
          <a
            href="mailto:ekklesiaagora@gmail.com"
            className="font-garamond text-sm text-text-light hover:text-gold transition-colors"
          >
            ekklesiaagora@gmail.com
          </a>
          <p className="font-garamond text-xs text-text-mid mt-1">
            DMCA notices &amp; general inquiries
          </p>
        </div>
      </div>

      <div className="border-t border-gold/10 px-4 py-4 text-center">
        <p className="font-cinzel text-xs text-text-mid uppercase tracking-widest">
          &copy; {year} Ekklesia Agora. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
