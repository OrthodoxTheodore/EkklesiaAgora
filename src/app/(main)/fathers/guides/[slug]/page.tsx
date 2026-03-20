import { getStudyGuide } from '@/lib/firestore/patristic';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { StudyGuideViewer } from '@/components/fathers/StudyGuideViewer';
import { notFound } from 'next/navigation';
import type { PatristicText } from '@/lib/types/patristic';

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getStudyGuide(slug);
  if (!guide) notFound();

  // Build resolvedLinks: refId -> full URL path
  const patristicRefIds = guide.items
    .filter((item) => item.type === 'patristic' && item.refId)
    .map((item) => item.refId!);

  const resolvedLinks: Record<string, string> = {};
  if (patristicRefIds.length > 0) {
    const db = getAdminFirestore();
    // Fetch each referenced text to get its authorSlug
    const docs = await Promise.all(
      patristicRefIds.map((id) => db.collection('patristic_texts').doc(id).get())
    );
    docs.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data() as PatristicText;
        resolvedLinks[data.textId] = `/fathers/${data.authorSlug}/${data.textId}`;
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-2">
        {guide.title}
      </h1>
      <StudyGuideViewer guide={guide} resolvedLinks={resolvedLinks} />
    </div>
  );
}
