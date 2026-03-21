export const dynamic = 'force-dynamic';

import { getAdminFirestore } from '@/lib/firebase/admin';
import VideoCard, { VideoCardSkeleton } from '@/components/video/VideoCard';
import VideoBrowseClient from '@/components/video/VideoBrowseClient';
import { Suspense } from 'react';
import type { Video } from '@/lib/types/video';

interface VideosPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

async function VideoGrid({ category, search }: { category: string | null; search: string }) {
  const db = getAdminFirestore();

  let query = db
    .collection('videos')
    .where('status', '==', 'published');

  if (search.trim()) {
    // Search and category are mutually exclusive — search takes precedence
    query = query.where('searchKeywords', 'array-contains', search.trim().toLowerCase());
  } else if (category) {
    query = query.where('category', '==', category);
  }

  query = query.orderBy('createdAt', 'desc').limit(30);

  const snap = await query.get();
  const videos = snap.docs.map((doc) => doc.data() as Video);

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="font-cinzel text-xl font-bold text-text-light mb-3">No Videos Yet</h2>
        <p className="font-garamond text-base text-text-mid max-w-md mx-auto">
          Videos will appear here as channels and members share content. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.videoId} video={video} showInlinePlayback={false} />
      ))}
    </div>
  );
}

function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const { category, q } = await searchParams;
  const activeCategory = category ?? null;
  const searchQuery = q ?? '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Page heading */}
      <h1 className="font-cinzel text-2xl font-bold text-gold">Videos</h1>

      {/* Search + category filter (client) */}
      <VideoBrowseClient
        initialCategory={activeCategory}
        initialSearch={searchQuery}
      />

      {/* Video grid */}
      <Suspense fallback={<VideoGridSkeleton />}>
        <VideoGrid category={activeCategory} search={searchQuery} />
      </Suspense>
    </div>
  );
}
