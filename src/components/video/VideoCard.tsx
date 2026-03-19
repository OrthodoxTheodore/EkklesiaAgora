'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import VideoPlayer from './VideoPlayer';
import type { Video } from '@/lib/types/video';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = String(durationSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatRelativeTime(ts: { seconds: number } | null | undefined): string {
  if (!ts) return '';
  const now = Date.now();
  const diff = now - ts.seconds * 1000;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

// ─── VideoCard ────────────────────────────────────────────────────────────────

interface VideoCardProps {
  video: Video;
  showInlinePlayback?: boolean;
}

export default function VideoCard({ video, showInlinePlayback = false }: VideoCardProps) {
  const [isPlayingInline, setIsPlayingInline] = useState(false);

  const profileHref = video.channelHandle
    ? `/channel/${video.channelHandle}`
    : `/profile/${video.uploaderHandle}`;

  const initials = video.uploaderDisplayName.charAt(0).toUpperCase();

  function handleThumbnailClick() {
    if (showInlinePlayback) {
      setIsPlayingInline(true);
    }
  }

  return (
    <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] overflow-hidden">
      {/* Thumbnail / Player section */}
      <div className="relative aspect-video rounded-t-[6px] overflow-hidden bg-navy-light">
        {isPlayingInline ? (
          <VideoPlayer videoUrl={video.videoUrl} thumbnailUrl={video.thumbnailUrl} />
        ) : (
          <div
            className="w-full h-full cursor-pointer"
            onClick={handleThumbnailClick}
            role={showInlinePlayback ? 'button' : undefined}
            aria-label={showInlinePlayback ? `Play ${video.title} inline` : undefined}
            tabIndex={showInlinePlayback ? 0 : undefined}
            onKeyDown={showInlinePlayback ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleThumbnailClick(); } : undefined}
          >
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-navy-light" />
            )}
          </div>
        )}

        {/* Duration chip */}
        {!isPlayingInline && (
          <span className="absolute bottom-2 right-2 bg-black/70 font-cinzel text-xs text-white px-2 py-1 rounded">
            {formatDuration(video.durationSeconds)}
          </span>
        )}
      </div>

      {/* Metadata section */}
      <div className="p-3">
        <div className="flex gap-3">
          {/* Channel/uploader avatar */}
          <Link href={profileHref} className="flex-shrink-0" tabIndex={-1}>
            {video.uploaderAvatarUrl ? (
              <img
                src={video.uploaderAvatarUrl}
                alt={video.uploaderDisplayName}
                className="w-9 h-9 rounded-full border border-gold/[0.15] object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full border border-gold/[0.15] bg-gold-dim flex items-center justify-center flex-shrink-0">
                <span className="font-cinzel text-sm text-navy font-semibold uppercase">
                  {initials}
                </span>
              </div>
            )}
          </Link>

          {/* Content column */}
          <div className="min-w-0 flex-1">
            {/* Title */}
            <Link
              href={`/videos/${video.videoId}`}
              className="font-cinzel text-base text-text-light hover:text-gold-bright transition-colors line-clamp-2 block"
            >
              {video.title}
            </Link>

            {/* Metadata row */}
            <p className="font-cinzel text-xs text-text-mid mt-1">
              {formatViewCount(video.viewCount)} views
              {video.createdAt && (
                <> &bull; {formatRelativeTime(video.createdAt as unknown as { seconds: number })}</>
              )}
            </p>

            {/* Category chip */}
            <span className="inline-block mt-1 font-cinzel text-xs text-gold-dim bg-navy-light border border-gold/[0.15] rounded-full px-2 py-0.5">
              {video.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VideoCardSkeleton ────────────────────────────────────────────────────────

export function VideoCardSkeleton() {
  return (
    <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] overflow-hidden">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-navy-light animate-pulse rounded-t-[6px]" />

      {/* Metadata skeleton */}
      <div className="p-3 flex gap-3">
        {/* Avatar skeleton */}
        <div className="w-9 h-9 rounded-full bg-navy-light animate-pulse flex-shrink-0" />

        {/* Text skeletons */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-navy-light animate-pulse rounded w-full" />
          <div className="h-3 bg-navy-light animate-pulse rounded w-2/3" />
          <div className="h-3 bg-navy-light animate-pulse rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}
