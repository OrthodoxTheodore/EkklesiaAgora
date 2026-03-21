export const dynamic = 'force-dynamic';

import { getStudyGuides } from '@/lib/firestore/patristic';
import { StudyGuideCard } from '@/components/fathers/StudyGuideCard';

export default async function GuidesPage() {
  const guides = await getStudyGuides();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-6">
        Study Guides
      </h1>
      <p className="font-garamond text-base text-text-light leading-relaxed mb-8">
        Curated learning paths drawing from Scripture and the Church Fathers. Each guide presents
        readings in a recommended order to deepen understanding.
      </p>
      {guides.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="font-cinzel text-sm text-text-mid mb-2">Study guides coming soon</h2>
          <p className="font-garamond text-sm text-text-mid">
            Check back soon for curated learning paths.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides.map((g) => (
            <StudyGuideCard key={g.guideId} guide={g} />
          ))}
        </div>
      )}
    </div>
  );
}
