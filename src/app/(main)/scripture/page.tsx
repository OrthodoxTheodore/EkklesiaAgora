export const dynamic = 'force-dynamic';

import { getBooks } from '@/lib/firestore/scripture';
import { TRANSLATIONS } from '@/lib/types/scripture';
import { ScriptureSearch } from '@/components/scripture/ScriptureSearch';
import Link from 'next/link';

export default async function ScriptureLandingPage() {
  const otBooks = await getBooks(TRANSLATIONS.BRENTON);
  const ntBooks = await getBooks(TRANSLATIONS.EOB_NT);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-6">
        Scripture Library
      </h1>

      <ScriptureSearch />

      {/* OT Section */}
      <h2 className="font-cinzel text-xs uppercase tracking-widest text-gold mt-12 mb-4">
        Old Testament — Brenton Septuagint
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {otBooks.map(book => (
          <li key={book.bookId}>
            <Link href={`/scripture/${book.bookAbbrev}/1`}
              className="block bg-navy-mid border border-gold/[0.15] rounded-[6px] p-4 hover:border-gold/40 transition-colors">
              <span className="font-cinzel text-gold text-base">{book.bookName}</span>
              <span className="block font-cinzel text-xs text-text-mid mt-1">
                {book.chapterCount} chapters
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* NT Section */}
      <h2 className="font-cinzel text-xs uppercase tracking-widest text-gold mt-12 mb-4">
        New Testament — Eastern Orthodox Bible
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ntBooks.map(book => (
          <li key={book.bookId}>
            <Link href={`/scripture/${book.bookAbbrev}/1`}
              className="block bg-navy-mid border border-gold/[0.15] rounded-[6px] p-4 hover:border-gold/40 transition-colors">
              <span className="font-cinzel text-gold text-base">{book.bookName}</span>
              <span className="block font-cinzel text-xs text-text-mid mt-1">
                {book.chapterCount} chapters
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
