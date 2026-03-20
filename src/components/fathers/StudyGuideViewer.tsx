'use client';

import Link from 'next/link';
import type { StudyGuide } from '@/lib/types/patristic';

interface StudyGuideViewerProps {
  guide: StudyGuide;
  resolvedLinks: Record<string, string>;
}

export function StudyGuideViewer({ guide, resolvedLinks }: StudyGuideViewerProps) {
  return (
    <div>
      <p className="font-garamond text-base text-text-light leading-relaxed mb-8">
        {guide.description}
      </p>
      <ol className="space-y-6">
        {guide.items.map((item) => (
          <li key={item.step} className="flex gap-4 items-start border-b border-gold/[0.10] pb-6">
            <span className="font-cinzel text-gold text-lg shrink-0">{item.step}.</span>
            <div>
              <p className="font-cinzel text-gold text-sm mb-1">{item.title}</p>
              <p className="font-garamond text-sm text-text-light mb-2">{item.description}</p>
              {item.type === 'patristic' && item.refId && (
                <Link
                  href={resolvedLinks[item.refId] || '#'}
                  className="font-cinzel text-xs text-gold hover:underline uppercase tracking-wider"
                >
                  Read Text
                </Link>
              )}
              {item.type === 'scripture' && item.href && (
                <Link
                  href={item.href}
                  className="font-cinzel text-xs text-gold hover:underline uppercase tracking-wider"
                >
                  Read Scripture
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
