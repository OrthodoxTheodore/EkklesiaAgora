import Link from 'next/link';
import type { ReadingRef as ReadingRefType } from '@/lib/types/calendar';
import { BOOK_ABBREV_MAP } from '@/lib/types/scripture';

interface ReadingRefProps {
  reading: ReadingRefType;
  label: string;
}

export function ReadingRef({ reading, label }: ReadingRefProps) {
  const bookInfo = BOOK_ABBREV_MAP[reading.book];
  const slug = bookInfo?.slug || reading.book.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-center gap-2">
      <span className="font-cinzel text-xs uppercase tracking-widest text-gold-dim">
        {label}:
      </span>
      <Link
        href={`/scripture/${slug}/${reading.chapter}#verse-${reading.verseStart}`}
        className="text-gold hover:underline font-garamond text-sm"
      >
        {reading.display}
      </Link>
    </div>
  );
}
