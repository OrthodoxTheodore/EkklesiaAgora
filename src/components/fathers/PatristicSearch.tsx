'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PatristicText } from '@/lib/types/patristic';

interface PatristicSearchProps {
  initialResults: PatristicText[];
  initialQuery: string;
}

export function PatristicSearch({ initialResults, initialQuery }: PatristicSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const results = initialResults;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/fathers/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-end mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search Church Fathers texts"
          placeholder="Search the Fathers..."
          className="bg-navy-mid border border-gold/[0.15] rounded text-text-light font-garamond text-base px-4 py-2 focus:outline-none focus:border-gold/60 w-full"
        />
        <button
          type="submit"
          className="font-cinzel text-xs uppercase tracking-widest text-navy bg-gold rounded px-4 py-2 hover:bg-gold/90 transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {initialQuery && (
        <div>
          {results.length === 0 ? (
            <div className="py-8">
              <h2 className="font-cinzel text-gold text-sm">No texts match your search</h2>
              <p className="font-garamond text-sm text-text-mid mt-2">
                Try different keywords, or browse by author.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(result => (
                <Link
                  key={result.textId}
                  href={`/fathers/${result.authorSlug}/${result.textId}`}
                  className="block bg-navy-mid border border-gold/[0.15] rounded p-4 hover:border-gold/40 transition-colors"
                >
                  <span className="font-cinzel text-sm text-gold block">{result.title}</span>
                  <span className="font-garamond text-xs text-text-mid block mt-1">
                    {result.authorName} — {result.era}
                  </span>
                  <span className="font-cinzel text-xs text-text-mid block mt-1">
                    {result.topics.join(' / ')}
                  </span>
                  <p className="font-garamond text-sm text-text-light mt-1">
                    {result.body.slice(0, 150)}...
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
