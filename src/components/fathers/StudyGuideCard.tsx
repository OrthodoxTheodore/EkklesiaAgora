import Link from 'next/link';
import type { StudyGuide } from '@/lib/types/patristic';

interface StudyGuideCardProps {
  guide: StudyGuide;
}

export function StudyGuideCard({ guide }: StudyGuideCardProps) {
  return (
    <Link
      href={`/fathers/guides/${guide.slug}`}
      className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-4 hover:border-gold/40 transition-colors block"
    >
      <span className="font-cinzel text-xs uppercase tracking-widest text-text-mid">
        {guide.topic}
      </span>
      <h3 className="font-cinzel text-sm text-gold mt-2">{guide.title}</h3>
      <p className="font-garamond text-sm text-text-light mt-2 line-clamp-2">
        {guide.description}
      </p>
      <span className="font-cinzel text-xs text-text-mid mt-3 block">
        {guide.items.length} steps
      </span>
    </Link>
  );
}
