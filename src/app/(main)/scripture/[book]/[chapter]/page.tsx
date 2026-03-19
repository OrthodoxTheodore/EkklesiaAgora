import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getChapter, getBookMeta, getBooks } from '@/lib/firestore/scripture';
import { TRANSLATIONS } from '@/lib/types/scripture';
import { ScriptureReader } from '@/components/scripture/ScriptureReader';
import { ScriptureSkeleton } from '@/components/scripture/ScriptureSkeleton';

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book, chapter } = await params;
  const chapterNum = parseInt(chapter, 10);

  if (isNaN(chapterNum) || chapterNum < 1) notFound();

  const bookMeta = await getBookMeta(book);
  if (!bookMeta) notFound();

  const verses = await getChapter(bookMeta.translationId, book, chapterNum);
  const allBooks = [
    ...(await getBooks(TRANSLATIONS.BRENTON)),
    ...(await getBooks(TRANSLATIONS.EOB_NT)),
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-2">
        {bookMeta.bookName} {chapterNum}
      </h1>
      <Suspense fallback={<ScriptureSkeleton />}>
        <ScriptureReader
          initialVerses={verses}
          bookMeta={bookMeta}
          currentChapter={chapterNum}
          allBooks={allBooks}
        />
      </Suspense>
    </div>
  );
}
