'use client';

import { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { SaintStory } from '@/lib/types/calendar';

interface SaintCardProps {
  story: SaintStory;
  feastLevel: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function getCardClassName(feastLevel: number): string {
  if (feastLevel >= 5) return 'border-gold bg-gold-pale/[0.05]';
  if (feastLevel >= 3) return 'border-gold/[0.30]';
  return '';
}

function getTitleClassName(feastLevel: number): string {
  if (feastLevel >= 5) return 'text-gold-bright';
  if (feastLevel >= 3) return 'text-gold';
  if (feastLevel >= 1) return 'text-gold-dim';
  return 'text-text-light';
}

export function SaintCard({ story, feastLevel }: SaintCardProps) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const storyId = `saint-story-${id.replace(/:/g, '')}`;

  const plainText = stripHtml(story.story);
  const excerpt = plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;

  return (
    <Card className={getCardClassName(feastLevel)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={`font-cinzel text-sm font-semibold ${getTitleClassName(feastLevel)}`}>
          {story.title}
        </h3>
        <button
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={storyId}
          className="shrink-0 text-gold hover:text-gold-bright transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {!expanded && (
        <p className="mt-2 text-text-mid italic font-garamond text-sm">{excerpt}</p>
      )}

      <div
        id={storyId}
        className={expanded ? 'mt-3' : 'hidden'}
      >
        <div
          className="font-garamond text-base text-text-light leading-relaxed"
          dangerouslySetInnerHTML={{ __html: story.story }}
        />
      </div>
    </Card>
  );
}
