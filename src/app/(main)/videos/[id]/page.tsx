export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getVideoById } from '@/lib/firestore/videos';
import { incrementViewCount } from '@/app/actions/videos';
import { getJurisdictionLabel } from '@/lib/constants/jurisdictions';
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoCard from '@/components/video/VideoCard';
import VideoDetailClient from '@/components/video/VideoDetailClient';
import Link from 'next/link';
import type { Video, VideoComment } from '@/lib/types/video';

function getAuthConfig() {
  return {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: 'AuthToken',
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT!,
    process.env.COOKIE_SECRET_PREVIOUS!,
  ],
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: ((process.env.FIREBASE_PRIVATE_KEY ?? '').includes('-----BEGIN') ? process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n') : Buffer.from(process.env.FIREBASE_PRIVATE_KEY!, 'base64').toString('utf-8')),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
};
}

interface VideoDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(ts: { seconds: number } | null | undefined): string {
  if (!ts) return '';
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = String(durationSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const { id: videoId } = await params;

  // ── Auth (optional — video detail is semi-public) ──────────────────────────
  const tokens = await getTokens(await cookies(), getAuthConfig());
  const uid: string | null = tokens?.decodedToken.uid ?? null;
  const callerRoleLevel: number =
    (tokens?.decodedToken as { roleLevel?: number } | undefined)?.roleLevel ?? 0;

  // ── Fetch video ────────────────────────────────────────────────────────────
  const video = await getVideoById(videoId);

  if (
    !video ||
    (video.status !== 'published' && uid !== video.uploaderUid && callerRoleLevel < 2)
  ) {
    notFound();
  }

  // ── Increment view count (fire-and-forget, best effort) ────────────────────
  void incrementViewCount(videoId);

  const db = getAdminFirestore();

  // ── Check if current user has liked ───────────────────────────────────────
  let initialLiked = false;
  if (uid) {
    const likeDoc = await db
      .collection('videos')
      .doc(videoId)
      .collection('likes')
      .doc(uid)
      .get();
    initialLiked = likeDoc.exists;
  }

  // ── Fetch comments ─────────────────────────────────────────────────────────
  const commentsSnap = await db
    .collection('videos')
    .doc(videoId)
    .collection('comments')
    .orderBy('createdAt', 'asc')
    .get();
  const comments = commentsSnap.docs.map((doc) => doc.data() as VideoComment);

  // ── Fetch related videos ───────────────────────────────────────────────────
  let relatedVideos: Video[] = [];

  if (video.channelId) {
    const channelSnap = await db
      .collection('videos')
      .where('channelId', '==', video.channelId)
      .where('status', '==', 'published')
      .limit(6)
      .get();
    relatedVideos = channelSnap.docs
      .map((doc) => doc.data() as Video)
      .filter((v) => v.videoId !== videoId)
      .slice(0, 5);
  }

  // Backfill with category videos if fewer than 5
  if (relatedVideos.length < 5) {
    const needed = 5 - relatedVideos.length;
    const existingIds = new Set([videoId, ...relatedVideos.map((v) => v.videoId)]);
    const categorySnap = await db
      .collection('videos')
      .where('category', '==', video.category)
      .where('status', '==', 'published')
      .limit(needed + existingIds.size)
      .get();
    const categoryVideos = categorySnap.docs
      .map((doc) => doc.data() as Video)
      .filter((v) => !existingIds.has(v.videoId))
      .slice(0, needed);
    relatedVideos = [...relatedVideos, ...categoryVideos];
  }

  // ── Jurisdiction badge ─────────────────────────────────────────────────────
  const jurisdictionLabel = video.uploaderJurisdictionId
    ? getJurisdictionLabel(video.uploaderJurisdictionId)
    : null;

  const profileHref = video.channelHandle
    ? `/channel/${video.channelHandle}`
    : `/profile/${video.uploaderHandle}`;

  const uploaderInitials = video.uploaderDisplayName.charAt(0).toUpperCase();

  const sidebarHeading =
    video.channelId && relatedVideos.length > 0 && relatedVideos[0]?.channelId === video.channelId
      ? 'More from this channel'
      : `More in ${video.category}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/videos"
        className="font-cinzel text-xs uppercase tracking-widest text-text-mid hover:text-gold transition-colors mb-6 block"
      >
        &larr; Back to Videos
      </Link>

      {/* Two-column layout */}
      <div className="lg:grid lg:grid-cols-3 gap-6">
        {/* ── Left column (main content) ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video player */}
          <VideoPlayer videoUrl={video.videoUrl} thumbnailUrl={video.thumbnailUrl} />

          {/* Metadata block */}
          <div className="space-y-3">
            {/* Title */}
            <h1 className="font-cinzel text-xl font-bold text-text-light">{video.title}</h1>

            {/* Stats row */}
            <p className="font-cinzel text-xs text-text-mid">
              {formatViewCount(video.viewCount)} views
              {' \u2022 '}
              {formatDuration(video.durationSeconds)}
              {video.createdAt && (
                <> &bull; {formatDate(video.createdAt as unknown as { seconds: number })}</>
              )}
            </p>

            {/* Channel/uploader row */}
            <div className="flex items-center gap-3">
              <Link href={profileHref}>
                {video.uploaderAvatarUrl ? (
                  <img
                    src={video.uploaderAvatarUrl}
                    alt={video.uploaderDisplayName}
                    className="w-10 h-10 rounded-full border border-gold/[0.15] object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-gold/[0.15] bg-gold-dim flex items-center justify-center">
                    <span className="font-cinzel text-sm text-navy font-semibold uppercase">
                      {uploaderInitials}
                    </span>
                  </div>
                )}
              </Link>
              <div>
                <Link
                  href={profileHref}
                  className="font-cinzel text-base text-text-light hover:text-gold transition-colors block"
                >
                  {video.uploaderDisplayName}
                </Link>
                <span className="font-cinzel text-xs text-text-mid">
                  @{video.uploaderHandle}
                </span>
              </div>
            </div>

            {/* Jurisdiction badge */}
            {jurisdictionLabel && (
              <p className="font-cinzel text-xs text-gold-dim">{jurisdictionLabel}</p>
            )}

            {/* Category chip */}
            <span className="inline-block font-cinzel text-xs text-gold-dim bg-navy-light border border-gold/[0.15] rounded-full px-2 py-0.5">
              {video.category}
            </span>
          </div>

          {/* ── Client-side interactivity (like, share, flag, comments) ──── */}
          <VideoDetailClient
            videoId={videoId}
            initialLiked={initialLiked}
            initialLikeCount={video.likeCount}
            commentCount={video.commentCount}
            currentUserUid={uid}
            currentUserRoleLevel={callerRoleLevel}
            initialComments={comments}
          />

          {/* Description */}
          {video.description && (
            <div className="mt-4">
              <p className="font-garamond text-base text-text-light leading-relaxed whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Right sidebar (related videos) ─────────────────────────────── */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <h2 className="font-cinzel text-base text-text-light mb-4">{sidebarHeading}</h2>
          {relatedVideos.length > 0 ? (
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <VideoCard
                  key={relatedVideo.videoId}
                  video={relatedVideo}
                  showInlinePlayback={false}
                />
              ))}
            </div>
          ) : (
            <p className="font-garamond text-base text-text-mid">
              No related videos found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
