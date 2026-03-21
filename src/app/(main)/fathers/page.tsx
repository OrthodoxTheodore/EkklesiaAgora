export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getPatristicAuthors } from '@/lib/firestore/patristic';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { FathersGrid } from '@/components/fathers/FathersGrid';
import type { PatristicText } from '@/lib/types/patristic';

export default async function FathersPage() {
  const [authors, textsSnap] = await Promise.all([
    getPatristicAuthors(),
    getAdminFirestore().collection('patristic_texts').select('authorSlug', 'topics').get(),
  ]);

  // Build topic index: { topicName: [authorSlug1, authorSlug2, ...] }
  const topicIndex: Record<string, string[]> = {};
  textsSnap.docs.forEach(doc => {
    const data = doc.data() as Pick<PatristicText, 'authorSlug' | 'topics'>;
    (data.topics || []).forEach(topic => {
      if (!topicIndex[topic]) topicIndex[topic] = [];
      if (!topicIndex[topic].includes(data.authorSlug)) {
        topicIndex[topic].push(data.authorSlug);
      }
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-6">
        Church Fathers
      </h1>
      <Link
        href="/fathers/search"
        className="block w-full bg-navy-mid border border-gold/[0.15] rounded text-text-mid font-garamond text-base px-4 py-2 mb-8 hover:border-gold/40 transition-colors"
        aria-label="Search Church Fathers texts"
      >
        Search the Fathers...
      </Link>
      <FathersGrid authors={authors} topicIndex={topicIndex} />
    </div>
  );
}
