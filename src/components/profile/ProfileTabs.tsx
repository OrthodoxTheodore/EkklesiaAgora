'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import PostCard from '@/components/agora/PostCard';
import { getVideoEmbed } from '@/lib/utils/videoEmbed';
import type { Post } from '@/lib/types/social';
import type { Video } from '@/lib/types/video';

interface ProfileTabsProps {
  posts: Post[];
  videos: Video[];
  currentUserUid: string;
}

interface MediaItem {
  key: string;
  href: string;
  thumbnailUrl: string | null;
  label: string;
  isPlayable: boolean;
}

export function ProfileTabs({ posts: initialPosts, videos, currentUserUid }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'media'>('posts');
  const [posts, setPosts] = useState(initialPosts);

  function handlePostDeleted(postId: string) {
    setPosts((prev) => prev.filter((p) => p.postId !== postId));
  }

  const mediaItems: MediaItem[] = [
    ...videos.map((v): MediaItem => ({
      key: `video-${v.videoId}`,
      href: `/videos/${v.videoId}`,
      thumbnailUrl: v.thumbnailUrl,
      label: v.title,
      isPlayable: true,
    })),
    ...posts
      .filter((p) => p.imageUrl || (p.linkPreview && getVideoEmbed(p.linkPreview.url)))
      .map((p): MediaItem => {
        const embed = p.linkPreview ? getVideoEmbed(p.linkPreview.url) : null;
        return {
          key: `post-${p.postId}`,
          href: `/agora/${p.postId}`,
          thumbnailUrl: p.imageUrl ?? p.linkPreview?.imageUrl ?? null,
          label: p.text || p.linkPreview?.title || 'Post',
          isPlayable: !!embed,
        };
      }),
  ];

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        className="flex border-b border-gold/[0.10] mb-4"
        aria-label="Profile content tabs"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'posts'}
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 font-cinzel text-xs uppercase tracking-widest transition-colors ${
            activeTab === 'posts'
              ? 'text-gold border-b-2 border-gold'
              : 'text-text-mid hover:text-text-light'
          }`}
        >
          Posts
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'media'}
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2 font-cinzel text-xs uppercase tracking-widest transition-colors ${
            activeTab === 'media'
              ? 'text-gold border-b-2 border-gold'
              : 'text-text-mid hover:text-text-light'
          }`}
        >
          Media
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'posts' && (
        <div role="tabpanel" aria-label="Posts tab content">
          {posts.length === 0 ? (
            <p className="font-garamond text-text-mid text-center py-12">
              No posts yet
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  currentUserUid={currentUserUid}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <div role="tabpanel" aria-label="Media tab content">
          {mediaItems.length === 0 ? (
            <p className="font-garamond text-text-mid text-center py-12">
              No media yet
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mediaItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="relative aspect-square block bg-navy-light border border-gold/[0.10] rounded-md overflow-hidden group"
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-mid text-xs font-garamond p-2 text-center line-clamp-4">
                      {item.label}
                    </div>
                  )}
                  {item.isPlayable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
                      <Play className="w-8 h-8 text-white drop-shadow" fill="white" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
