export const dynamic = 'force-dynamic';

import { searchPatristicTexts } from '@/lib/firestore/patristic';
import { PatristicSearch } from '@/components/fathers/PatristicSearch';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || '';
  const results = query ? await searchPatristicTexts(query) : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-6">
        Search the Fathers
      </h1>
      <PatristicSearch initialResults={results} initialQuery={query} />
    </div>
  );
}
