import type { ReadingRef as ReadingRefType } from '@/lib/types/calendar';

interface ReadingRefProps {
  reading: ReadingRefType;
  label: string;
}

export function ReadingRef({ reading, label }: ReadingRefProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-cinzel text-xs uppercase tracking-widest text-gold-dim">
        {label}:
      </span>
      <span className="text-gold font-garamond text-sm">
        {reading.display}
      </span>
    </div>
  );
}
