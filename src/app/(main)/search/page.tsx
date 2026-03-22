export const dynamic = 'force-dynamic';

import { globalSearch } from '@/lib/firestore/search';
import { SearchResultsClient } from '@/components/search/SearchResultsClient';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tab?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', tab = 'all' } = await searchParams;
  const results = q ? await globalSearch(q) : null;
  return (
    <main className="max-w-3xl mx-auto px-4 pt-[86px]">
      <SearchResultsClient query={q} initialTab={tab} results={results} />
    </main>
  );
}
