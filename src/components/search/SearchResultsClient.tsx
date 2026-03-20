'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GlobalSearchResults } from '@/lib/firestore/search';
import { SearchResultCard } from './SearchResultCard';
import type { Timestamp } from 'firebase/firestore';

interface SearchResultsClientProps {
  query: string;
  initialTab: string;
  results: GlobalSearchResults | null;
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'videos', label: 'Videos' },
  { id: 'posts', label: 'Posts' },
  { id: 'people', label: 'People' },
  { id: 'scripture', label: 'Scripture' },
  { id: 'fathers', label: 'Church Fathers' },
] as const;

type TabId = typeof TABS[number]['id'];

function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts as unknown as string);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

function IndividualTabResults({
  items,
}: {
  items: React.ReactNode[];
}) {
  const [visibleCount, setVisibleCount] = useState(10);
  const visible = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <div>
      <div className="flex flex-col gap-2">{visible}</div>
      {hasMore && (
        <button
          onClick={() => setVisibleCount(c => c + 10)}
          className="w-full py-3 text-gold font-cinzel text-xs uppercase tracking-widest border border-gold/[0.15] rounded hover:bg-navy-light transition-colors mt-4"
        >
          Load More
        </button>
      )}
    </div>
  );
}

export function SearchResultsClient({ query, initialTab, results }: SearchResultsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>((initialTab as TabId) || 'all');
  const [emptyInput, setEmptyInput] = useState('');

  function switchTab(tabId: TabId) {
    setActiveTab(tabId);
    router.push('/search?q=' + encodeURIComponent(query) + '&tab=' + tabId);
  }

  function handleEmptySearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && emptyInput.trim()) {
      router.push('/search?q=' + encodeURIComponent(emptyInput.trim()));
    }
  }

  // Empty state: no query OR results is null
  if (!query || results === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="font-cinzel text-xl text-gold">Search Ekklesia Agora</h1>
        <p className="text-text-mid font-garamond text-base mt-2">
          Find videos, posts, people, Scripture, and Church Fathers writings.
        </p>
        <div className="mt-6 w-full max-w-md">
          <input
            type="search"
            value={emptyInput}
            onChange={e => setEmptyInput(e.target.value)}
            onKeyDown={handleEmptySearch}
            placeholder="Search videos, posts, people, Scripture, Fathers..."
            className="w-full bg-navy-mid border border-gold/[0.15] rounded px-4 py-2.5 text-sm font-garamond text-text-light placeholder:text-text-mid focus-visible:ring-1 focus-visible:ring-gold/60 focus-visible:outline-none"
            aria-label="Search"
            autoFocus
          />
        </div>
      </div>
    );
  }

  const { videos, posts, people, scripture, fathers } = results;
  const totalCount = videos.length + posts.length + people.length + scripture.length + fathers.length;

  // No results state
  if (totalCount === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-mid font-garamond text-base">No results for &apos;{query}&apos;</p>
        <p className="text-text-mid font-garamond text-sm mt-1">
          Try a shorter keyword or check your spelling.
        </p>
      </div>
    );
  }

  // Build card arrays for each type
  const videoCards = videos.map(v => (
    <SearchResultCard
      key={v.videoId}
      type="VIDEO"
      title={v.title}
      context={(v.channelId || 'Uncategorized') + (v.createdAt ? ' - ' + formatDate(v.createdAt) : '')}
      href={'/videos/' + v.videoId}
    />
  ));

  const postCards = posts.map(p => (
    <SearchResultCard
      key={p.postId}
      type="POST"
      title={truncate(p.text, 80)}
      context={formatDate(p.createdAt)}
      href={'/agora/' + p.postId}
    />
  ));

  const peopleCards = people.map(m => (
    <SearchResultCard
      key={m.uid}
      type="PERSON"
      title={m.displayName}
      context={m.jurisdictionId || 'Member'}
      href={'/profile/' + m.handle}
    />
  ));

  const scriptureCards = scripture.map(v => (
    <SearchResultCard
      key={v.verseId}
      type="SCRIPTURE"
      title={v.bookAbbrev + ' ' + v.chapter + ':' + v.verse}
      context={truncate(v.text, 80)}
      href={'/scripture/' + v.bookAbbrev.toLowerCase() + '/' + v.chapter}
    />
  ));

  const fatherCards = fathers.map(t => (
    <SearchResultCard
      key={t.textId}
      type="FATHERS"
      title={t.title}
      context={t.authorName + ' - ' + t.era}
      href={'/fathers/' + t.authorSlug + '/' + t.textId}
    />
  ));

  const sectionDefs: Array<{ tabId: TabId; label: string; cards: React.ReactNode[] }> = [
    { tabId: 'videos', label: 'Videos', cards: videoCards },
    { tabId: 'posts', label: 'Posts', cards: postCards },
    { tabId: 'people', label: 'People', cards: peopleCards },
    { tabId: 'scripture', label: 'Scripture', cards: scriptureCards },
    { tabId: 'fathers', label: 'Church Fathers', cards: fatherCards },
  ];

  const tabCardMap: Record<TabId, React.ReactNode[]> = {
    all: [],
    videos: videoCards,
    posts: postCards,
    people: peopleCards,
    scripture: scriptureCards,
    fathers: fatherCards,
  };

  return (
    <div>
      {/* Tab bar */}
      <nav className="flex gap-6 border-b border-gold/[0.15] mb-6 overflow-x-auto" aria-label="Search result type filters">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={
              activeTab === tab.id
                ? 'text-gold border-b-2 border-gold pb-2 font-cinzel text-xs uppercase tracking-widest whitespace-nowrap'
                : 'text-text-mid hover:text-text-light pb-2 font-cinzel text-xs uppercase tracking-widest whitespace-nowrap'
            }
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* All tab */}
      {activeTab === 'all' && (
        <div className="flex flex-col gap-8">
          {sectionDefs
            .filter(s => s.cards.length > 0)
            .map(s => (
              <section key={s.tabId}>
                <h2 className="font-cinzel text-xl text-gold uppercase tracking-widest border-b border-gold/[0.15] pb-2 mb-4">
                  {s.label}
                </h2>
                <div className="flex flex-col gap-2">
                  {s.cards.slice(0, 5)}
                </div>
                {s.cards.length > 5 && (
                  <button
                    onClick={() => switchTab(s.tabId)}
                    className="text-gold hover:text-gold-bright font-garamond text-sm mt-2 inline-block"
                  >
                    See all {s.cards.length} {s.label.toLowerCase()} results
                  </button>
                )}
              </section>
            ))}
        </div>
      )}

      {/* Individual tabs */}
      {activeTab !== 'all' && (
        <IndividualTabResults items={tabCardMap[activeTab]} />
      )}
    </div>
  );
}
