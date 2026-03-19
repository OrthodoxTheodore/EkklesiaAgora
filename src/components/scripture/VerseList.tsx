'use client';

import { useEffect, useState } from 'react';
import type { ScriptureVerse } from '@/lib/types/scripture';

interface VerseListProps {
  verses: ScriptureVerse[];
  highlightVerse?: number;
}

export function VerseList({ verses, highlightVerse: initialHighlight }: VerseListProps) {
  const [highlightVerse, setHighlightVerse] = useState<number | undefined>(initialHighlight);

  useEffect(() => {
    setHighlightVerse(initialHighlight);
    if (initialHighlight !== undefined) {
      const timer = setTimeout(() => {
        setHighlightVerse(undefined);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [initialHighlight]);

  if (!verses.length) return null;

  const { bookName, chapter } = verses[0];

  return (
    <div role="article" aria-label={`${bookName} Chapter ${chapter}`}>
      <p className="font-garamond text-lg text-text-light leading-[1.75]">
        {verses.map((verse) => {
          const isHighlighted = highlightVerse === verse.verse;
          return (
            <span
              key={verse.verseId}
              id={`verse-${verse.verse}`}
              className={isHighlighted ? 'bg-gold/[0.15] transition-colors duration-[2000ms]' : undefined}
              aria-current={isHighlighted ? 'true' : undefined}
            >
              <sup className="text-gold text-[11px] mr-1 select-none">{verse.verse}</sup>
              <span className="font-garamond text-lg text-text-light leading-[1.75]">{verse.text} </span>
            </span>
          );
        })}
      </p>
    </div>
  );
}
