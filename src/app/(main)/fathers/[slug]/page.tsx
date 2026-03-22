export const dynamic = 'force-dynamic';

import { getAuthor, getAuthorTexts } from '@/lib/firestore/patristic';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [author, texts] = await Promise.all([getAuthor(slug), getAuthorTexts(slug)]);
  if (!author) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <span className="font-cinzel text-xs uppercase tracking-widest text-text-mid mb-2 block">
        {author.eraLabel}
      </span>
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-4">
        {author.name}
      </h1>
      <p className="font-garamond text-base text-text-light leading-relaxed mb-2">{author.bio}</p>
      {author.feastDay && (
        <p className="font-garamond text-sm text-text-mid mb-8">Feast Day: {author.feastDay}</p>
      )}
      <h2 className="font-cinzel text-xs uppercase tracking-widest text-text-mid mt-8 mb-4">Works</h2>
      <div className="space-y-0">
        {texts.map(text => (
          <Link
            key={text.textId}
            href={`/fathers/${slug}/${text.textId}`}
            className="block border-b border-gold/[0.15] py-4 hover:bg-navy-light/30 transition-colors px-2 -mx-2 rounded"
          >
            <span className="font-cinzel text-sm text-gold hover:text-gold-bright">{text.title}</span>
            {text.chapterOrHomily && (
              <span className="font-garamond text-xs text-text-mid ml-2">(Chapter {text.chapterOrHomily})</span>
            )}
            <div className="flex gap-2 mt-1">
              {text.topics.map(t => (
                <span key={t} className="font-cinzel text-xs text-text-mid">{t}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
