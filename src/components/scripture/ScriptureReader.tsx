'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VerseList } from '@/components/scripture/VerseList';
import { BookNavigator } from '@/components/scripture/BookNavigator';
import type { ScriptureVerse, ScriptureBook } from '@/lib/types/scripture';

interface ScriptureReaderProps {
  initialVerses: ScriptureVerse[];
  bookMeta: ScriptureBook;
  currentChapter: number;
  allBooks: ScriptureBook[];
}

export function ScriptureReader({
  initialVerses,
  bookMeta,
  currentChapter,
  allBooks,
}: ScriptureReaderProps) {
  const [highlightVerse, setHighlightVerse] = useState<number | undefined>(undefined);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#verse-')) {
      const verseNum = parseInt(hash.replace('#verse-', ''), 10);
      if (!isNaN(verseNum)) {
        setHighlightVerse(verseNum);
      }
    }
  }, []);

  if (!initialVerses.length) {
    return (
      <p className="font-garamond text-sm text-text-mid">
        This chapter could not be loaded. Please try refreshing the page.
      </p>
    );
  }

  const testamentLabel =
    bookMeta.testament === 'OT'
      ? 'Old Testament — Brenton Septuagint'
      : 'New Testament — Eastern Orthodox Bible';

  const showPrev = currentChapter > 1;
  const showNext = currentChapter < bookMeta.chapterCount;

  return (
    <div>
      <span className="font-cinzel text-xs uppercase tracking-widest text-text-mid block mb-4">
        {testamentLabel}
      </span>

      <BookNavigator
        books={allBooks}
        currentBook={bookMeta.bookAbbrev}
        currentChapter={currentChapter}
      />

      <VerseList verses={initialVerses} highlightVerse={highlightVerse} />

      {bookMeta.testament === 'NT' && (
        <p className="font-garamond text-xs text-text-mid mt-8">
          New Testament text from the Eastern Orthodox Bible (EOB), Patriarchal Text of 1904. Used with permission for non-commercial Orthodox purposes.
        </p>
      )}

      <div className="flex justify-between mt-8 pt-4 border-t border-gold/[0.15]">
        {showPrev ? (
          <Link
            href={`/scripture/${bookMeta.bookAbbrev}/${currentChapter - 1}`}
            className="font-cinzel text-xs text-gold py-4"
            aria-label={`Previous chapter: ${bookMeta.bookName} ${currentChapter - 1}`}
          >
            ← Previous Chapter
          </Link>
        ) : (
          <span />
        )}
        {showNext ? (
          <Link
            href={`/scripture/${bookMeta.bookAbbrev}/${currentChapter + 1}`}
            className="font-cinzel text-xs text-gold py-4"
            aria-label={`Next chapter: ${bookMeta.bookName} ${currentChapter + 1}`}
          >
            Next Chapter →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
