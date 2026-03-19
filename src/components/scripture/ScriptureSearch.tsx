'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { searchScripture } from '@/lib/actions/scripture';
import { BOOK_ABBREV_MAP } from '@/lib/types/scripture';
import type { ScriptureVerse } from '@/lib/types/scripture';

const REF_PATTERN = /^(\d?\s?[a-zA-Z]+)\s+(\d+)(?::(\d+))?$/;

interface ParsedReference {
  book: string;
  chapter: number;
  verse?: number;
  slug: string;
}

export function parseReference(query: string): ParsedReference | null {
  const match = query.trim().match(REF_PATTERN);
  if (!match) return null;

  const bookInput = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verse = match[3] ? parseInt(match[3], 10) : undefined;

  // Case-insensitive lookup in BOOK_ABBREV_MAP
  const bookKey = Object.keys(BOOK_ABBREV_MAP).find(
    (key) => key.toLowerCase() === bookInput.toLowerCase()
  );

  if (!bookKey) return null;

  const bookInfo = BOOK_ABBREV_MAP[bookKey];
  return { book: bookKey, chapter, verse, slug: bookInfo.slug };
}

interface SearchResultGroup {
  bookName: string;
  bookAbbrev: string;
  verses: ScriptureVerse[];
}

function groupResults(verses: ScriptureVerse[]): SearchResultGroup[] {
  const groups: Record<string, SearchResultGroup> = {};
  for (const verse of verses) {
    if (!groups[verse.bookName]) {
      groups[verse.bookName] = {
        bookName: verse.bookName,
        bookAbbrev: verse.bookAbbrev,
        verses: [],
      };
    }
    groups[verse.bookName].verses.push(verse);
  }
  return Object.values(groups);
}

function highlightKeyword(text: string, keyword: string): React.ReactNode {
  if (!keyword) return text;
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const idx = lowerText.indexOf(lowerKeyword);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-gold/[0.15] text-text-light">{text.slice(idx, idx + keyword.length)}</mark>
      {text.slice(idx + keyword.length)}
    </>
  );
}

export function ScriptureSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScriptureVerse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const parsed = parseReference(trimmed);
    if (parsed) {
      router.push(`/scripture/${parsed.slug}/${parsed.chapter}#verse-${parsed.verse ?? 1}`);
      return;
    }

    setLoading(true);
    setSearchedQuery(trimmed);
    try {
      const found = await searchScripture(trimmed);
      setResults(found);
    } finally {
      setLoading(false);
    }
  }

  const groups = results ? groupResults(results) : [];

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            id="scripture-search"
            label="Search Scripture"
            placeholder="Search Scripture (e.g., grace, John 3:16)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" size="md" loading={loading}>
          Search
        </Button>
      </form>

      {results !== null && (
        <div className="mt-6">
          {results.length === 0 ? (
            <div>
              <p className="font-cinzel text-gold text-sm">No verses matched that search</p>
              <p className="font-garamond text-sm text-text-mid mt-1">
                No verses matched your search. Try a different word or a reference like &ldquo;John 3:16&rdquo;.
              </p>
            </div>
          ) : (
            <>
              {results.length === 30 && (
                <p className="font-garamond text-sm text-text-mid mb-4">
                  Showing first 30 results. Refine your search for more specific matches.
                </p>
              )}
              {groups.map((group) => (
                <div key={group.bookName} className="mb-6">
                  <h3 className="font-cinzel text-gold text-xs uppercase tracking-widest mb-2">
                    {group.bookName} ({group.verses.length} result{group.verses.length !== 1 ? 's' : ''})
                  </h3>
                  <ul className="space-y-3">
                    {group.verses.map((verse) => (
                      <li key={verse.verseId}>
                        <button
                          onClick={() =>
                            router.push(
                              `/scripture/${verse.bookAbbrev}/${verse.chapter}#verse-${verse.verse}`
                            )
                          }
                          className="text-left w-full hover:bg-navy-mid/50 rounded p-1 -mx-1 transition-colors"
                        >
                          <span className="text-gold text-sm font-cinzel block">
                            {verse.bookName} {verse.chapter}:{verse.verse}
                          </span>
                          <span className="font-garamond text-sm text-text-light">
                            {highlightKeyword(verse.text, searchedQuery)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
