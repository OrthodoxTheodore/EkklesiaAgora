'use client';

import type { ReadingRef as ReadingRefType } from '@/lib/types/calendar';

interface ReadingRefProps {
  ref: ReadingRefType;
  label: string;
}

export function ReadingRef({ ref, label }: ReadingRefProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-cinzel text-xs uppercase tracking-widest text-gold-dim">
        {label}:
      </span>
      <span
        className="font-garamond text-sm text-text-mid/50 cursor-not-allowed"
        title="Scripture Library — coming soon"
        aria-disabled="true"
      >
        {ref.display}
      </span>
    </div>
  );
}
