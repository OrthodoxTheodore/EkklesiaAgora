'use client';

import Link from 'next/link';
import type { PatristicText } from '@/lib/types/patristic';

interface PatristicReaderProps {
  text: PatristicText;
  authorSlug: string;
  prevText: PatristicText | null;
  nextText: PatristicText | null;
}

function getAttributionLine(era: string): string {
  if (era === 'ante-nicene') {
    return 'From the Ante-Nicene Fathers series, Philip Schaff edition. Public domain.';
  }
  if (era === 'nicene' || era === 'post-nicene') {
    return 'From the Nicene and Post-Nicene Fathers series, Philip Schaff edition. Public domain.';
  }
  return 'From the Ante-Nicene Fathers series, Philip Schaff edition. Public domain.';
}

export function PatristicReader({ text, authorSlug, prevText, nextText }: PatristicReaderProps) {
  return (
    <div>
      <nav className="font-cinzel text-xs text-text-mid mb-4" aria-label="Breadcrumb">
        <Link href="/fathers" className="hover:text-gold">
          Church Fathers
        </Link>
        <span> / </span>
        <Link href={`/fathers/${authorSlug}`} className="hover:text-gold">
          {text.authorName}
        </Link>
      </nav>

      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-2">{text.title}</h1>

      {text.chapterOrHomily !== null && (
        <p className="font-cinzel text-xs text-text-mid mb-1">
          {text.workTitle} - Chapter {text.chapterOrHomily}
        </p>
      )}

      <p className="font-garamond text-xs text-text-mid italic mb-8">
        {getAttributionLine(text.era)}
      </p>

      <article className="font-garamond text-base text-text-light leading-relaxed whitespace-pre-line">
        {text.body}
      </article>

      <div className="flex justify-between mt-8 pt-4 border-t border-gold/[0.15]">
        {prevText ? (
          <Link
            href={`/fathers/${authorSlug}/${prevText.textId}`}
            className="font-cinzel text-xs text-gold py-4"
            aria-label={`Previous: ${prevText.title}`}
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {nextText ? (
          <Link
            href={`/fathers/${authorSlug}/${nextText.textId}`}
            className="font-cinzel text-xs text-gold py-4"
            aria-label={`Next: ${nextText.title}`}
          >
            Next →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
