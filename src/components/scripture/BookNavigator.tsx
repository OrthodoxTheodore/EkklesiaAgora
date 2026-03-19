'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { ScriptureBook } from '@/lib/types/scripture';

interface BookNavigatorProps {
  books: ScriptureBook[];
  currentBook: string;
  currentChapter: number;
}

export function BookNavigator({ books, currentBook, currentChapter }: BookNavigatorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(currentBook);

  const selectedBookMeta = books.find((b) => b.bookAbbrev === selectedBook);
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);

  const otBooks = books.filter((b) => b.testament === 'OT');
  const ntBooks = books.filter((b) => b.testament === 'NT');

  function handleBookChange(bookAbbrev: string) {
    setSelectedBook(bookAbbrev);
    setSelectedChapter(1);
  }

  function handleGo() {
    router.push(`/scripture/${selectedBook}/${selectedChapter}`);
    setIsOpen(false);
  }

  const chapterCount = selectedBookMeta?.chapterCount ?? 1;

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        size="sm"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Navigate
      </Button>

      {isOpen && (
        <div className="mt-2 p-3 bg-navy-mid border border-gold/[0.15] rounded-[6px] flex flex-wrap items-center gap-2">
          <select
            value={selectedBook}
            onChange={(e) => handleBookChange(e.target.value)}
            className="bg-navy border border-gold/[0.15] text-text-light font-garamond rounded px-2 py-1"
            aria-label="Select book"
          >
            <optgroup label="Old Testament">
              {otBooks.map((book) => (
                <option key={book.bookId} value={book.bookAbbrev}>
                  {book.bookName}
                </option>
              ))}
            </optgroup>
            <optgroup label="New Testament">
              {ntBooks.map((book) => (
                <option key={book.bookId} value={book.bookAbbrev}>
                  {book.bookName}
                </option>
              ))}
            </optgroup>
          </select>

          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(parseInt(e.target.value, 10))}
            className="bg-navy border border-gold/[0.15] text-text-light font-garamond rounded px-2 py-1"
            aria-label="Select chapter"
          >
            {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={handleGo}>
            Go
          </Button>
        </div>
      )}
    </div>
  );
}
