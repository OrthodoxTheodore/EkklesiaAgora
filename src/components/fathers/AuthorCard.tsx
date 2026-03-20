import Link from 'next/link';
import type { PatristicAuthor } from '@/lib/types/patristic';

interface AuthorCardProps {
  author: PatristicAuthor;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Link
      href={`/fathers/${author.authorSlug}`}
      className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-4 hover:border-gold/40 transition-colors focus-visible:ring-2 focus-visible:ring-gold/60 block"
    >
      <span className="font-cinzel text-xs uppercase tracking-widest text-text-mid">
        {author.eraLabel}
      </span>
      <h3 className="font-cinzel text-sm text-gold mt-1">{author.name}</h3>
      <p className="font-garamond text-sm text-text-light mt-2 line-clamp-2">
        {author.keyContribution}
      </p>
      {author.feastDay && (
        <p className="font-garamond text-xs text-text-mid mt-2">Feast: {author.feastDay}</p>
      )}
    </Link>
  );
}
