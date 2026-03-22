export const dynamic = 'force-dynamic';

import { getPatristicText, getAuthorTexts } from '@/lib/firestore/patristic';
import { PatristicReader } from '@/components/fathers/PatristicReader';
import { notFound } from 'next/navigation';

export default async function TextReaderPage({
  params,
}: {
  params: Promise<{ slug: string; textId: string }>;
}) {
  const { slug, textId } = await params;
  const [text, authorTexts] = await Promise.all([
    getPatristicText(textId),
    getAuthorTexts(slug),
  ]);
  if (!text) notFound();

  const idx = authorTexts.findIndex(t => t.textId === textId);
  const prevText = idx > 0 ? authorTexts[idx - 1] : null;
  const nextText = idx < authorTexts.length - 1 ? authorTexts[idx + 1] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PatristicReader text={text} authorSlug={slug} prevText={prevText} nextText={nextText} />
    </div>
  );
}
