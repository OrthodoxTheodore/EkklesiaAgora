'use client';

import { useState } from 'react';
import { AuthorCard } from '@/components/fathers/AuthorCard';
import { ORTHODOX_CATEGORIES } from '@/lib/constants/categories';
import type { PatristicAuthor, PatristicEra } from '@/lib/types/patristic';
import type { OrthodoxCategory } from '@/lib/constants/categories';

interface FathersGridProps {
  authors: PatristicAuthor[];
  topicIndex: Record<string, string[]>;
}

const ERA_ORDER: PatristicEra[] = ['apostolic', 'ante-nicene', 'nicene', 'post-nicene'];

const ERA_DISPLAY_NAMES: Record<PatristicEra, string> = {
  apostolic: 'Apostolic Fathers',
  'ante-nicene': 'Ante-Nicene Fathers',
  nicene: 'Nicene Fathers',
  'post-nicene': 'Post-Nicene Fathers',
};

export function FathersGrid({ authors, topicIndex }: FathersGridProps) {
  const [selectedTopic, setSelectedTopic] = useState<OrthodoxCategory | null>(null);

  const filteredAuthors = selectedTopic
    ? authors.filter(author =>
        topicIndex[selectedTopic]?.includes(author.authorSlug)
      )
    : authors;

  const groupedByEra: Record<PatristicEra, PatristicAuthor[]> = {
    apostolic: [],
    'ante-nicene': [],
    nicene: [],
    'post-nicene': [],
  };

  for (const author of filteredAuthors) {
    if (groupedByEra[author.era]) {
      groupedByEra[author.era].push(author);
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] gap-8">
      {/* Topic Filter Sidebar */}
      <aside>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setSelectedTopic(null)}
            className={
              selectedTopic === null
                ? 'font-cinzel text-xs uppercase tracking-widest text-navy bg-gold rounded px-3 py-1.5 text-left'
                : 'font-cinzel text-xs uppercase tracking-widest text-text-mid border border-gold/[0.15] rounded px-3 py-1.5 hover:text-gold hover:border-gold/40 transition-colors text-left focus-visible:ring-2 focus-visible:ring-gold/60'
            }
          >
            All
          </button>
          {ORTHODOX_CATEGORIES.map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={
                selectedTopic === topic
                  ? 'font-cinzel text-xs uppercase tracking-widest text-navy bg-gold rounded px-3 py-1.5 text-left'
                  : 'font-cinzel text-xs uppercase tracking-widest text-text-mid border border-gold/[0.15] rounded px-3 py-1.5 hover:text-gold hover:border-gold/40 transition-colors text-left focus-visible:ring-2 focus-visible:ring-gold/60'
              }
            >
              {topic}
            </button>
          ))}
        </div>
      </aside>

      {/* Author Grid */}
      <div>
        {filteredAuthors.length === 0 ? (
          <div className="py-8">
            <h2 className="font-cinzel text-gold text-sm">No Fathers in this category</h2>
            <p className="font-garamond text-sm text-text-mid mt-2">
              Try selecting a different topic or browse all Church Fathers.
            </p>
          </div>
        ) : (
          ERA_ORDER.map(era => {
            const eraAuthors = groupedByEra[era];
            if (eraAuthors.length === 0) return null;
            return (
              <div key={era}>
                <h2 className="font-cinzel text-xs uppercase tracking-widest text-text-mid mt-8 mb-3">
                  {ERA_DISPLAY_NAMES[era]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eraAuthors.map(author => (
                    <AuthorCard key={author.authorSlug} author={author} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
