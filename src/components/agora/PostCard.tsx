'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toggleLike } from '@/app/actions/likes';
import { deletePost } from '@/app/actions/posts';
import { getJurisdictionLabel } from '@/lib/constants/jurisdictions';
import type { Post } from '@/lib/types/social';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── LinkPreviewCard ─────────────────────────────────────────────────────────

interface LinkPreviewProps {
  preview: {
    url: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    siteName: string | null;
  };
}

function LinkPreviewCard({ preview }: LinkPreviewProps) {
  let hostname = preview.url;
  try {
    hostname = new URL(preview.url).hostname;
  } catch {
    // use raw URL as fallback
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-navy-light border border-gold/[0.10] rounded-md overflow-hidden mt-3 hover:border-gold/30 transition-colors"
    >
      {preview.imageUrl && (
        <img
          src={preview.imageUrl}
          alt={preview.title ?? 'Link preview'}
          className="w-full h-[120px] object-cover"
        />
      )}
      <div>
        {preview.title && (
          <p className="font-cinzel text-xs text-text-light px-3 pt-2 truncate">
            {preview.title}
          </p>
        )}
        {preview.description && (
          <p className="font-garamond text-base text-text-mid px-3 line-clamp-2">
            {preview.description}
          </p>
        )}
        <p className="font-cinzel text-xs text-text-mid px-3 pb-2 pt-1">{hostname}</p>
      </div>
    </a>
  );
}

// ─── PostCard ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  currentUserUid: string;
  onPostDeleted?: (postId: string) => void;
}

export default function PostCard({ post, currentUserUid, onPostDeleted }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check initial like status
  useEffect(() => {
    if (!currentUserUid) return;
    const db = getFirestore(firebaseApp);
    const likeDocRef = doc(db, 'posts', post.postId, 'likes', currentUserUid);
    getDoc(likeDocRef).then((snap) => {
      setIsLiked(snap.exists());
    });
  }, [post.postId, currentUserUid]);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  async function handleLike() {
    setLikeError(null);
    const prevLiked = isLiked;
    const prevCount = likeCount;
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      await toggleLike(currentUserUid, post.postId);
    } catch {
      // Rollback on failure
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      setLikeError("Couldn't update like. Please try again.");
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deletePost(currentUserUid, post.postId);
      setShowDeleteDialog(false);
      onPostDeleted?.(post.postId);
    } catch {
      setDeleteLoading(false);
    }
  }

  const isOwnPost = post.authorUid === currentUserUid;
  const jurisdictionLabel = post.authorJurisdictionId
    ? getJurisdictionLabel(post.authorJurisdictionId)
    : null;

  return (
    <Card>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Avatar */}
          {post.authorAvatarUrl ? (
            <img
              src={post.authorAvatarUrl}
              alt={`${post.authorDisplayName}'s avatar`}
              className="w-9 h-9 rounded-full border border-gold/[0.15] flex-shrink-0 object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full border border-gold/[0.15] flex-shrink-0 bg-gold-dim flex items-center justify-center">
              <span className="font-cinzel text-sm text-navy font-semibold uppercase">
                {post.authorDisplayName.charAt(0)}
              </span>
            </div>
          )}

          {/* Name + verified + handle + jurisdiction + timestamp */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link
              href={`/profile/${post.authorHandle}`}
              className="font-cinzel text-base text-text-light hover:text-gold transition-colors"
            >
              {post.authorDisplayName}
            </Link>
            {post.authorRoleLevel >= 2 && (
              <CheckCircle
                size={16}
                className="text-gold fill-gold"
                aria-label="Verified"
              />
            )}
            <span className="font-cinzel text-xs text-text-mid">
              @{post.authorHandle}
            </span>
            {jurisdictionLabel && (
              <span className="font-cinzel text-xs text-gold-dim">
                &bull; {jurisdictionLabel}
              </span>
            )}
            <span className="font-cinzel text-xs text-text-mid">
              {formatRelativeTime(post.createdAt as unknown as { seconds: number })}
            </span>
            {post.isEdited && (
              <span className="font-garamond text-xs italic text-text-mid">edited</span>
            )}
          </div>
        </div>

        {/* Three-dot overflow (own posts only) */}
        {isOwnPost && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-mid hover:text-text-light p-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-gold/60"
              aria-label="Post options"
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-navy-mid border border-gold/[0.15] rounded-md shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => { setShowMenu(false); /* Edit handled by parent or future plan */ }}
                  className="block w-full text-left px-4 py-2 font-garamond text-base text-text-light hover:bg-navy-light transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => { setShowMenu(false); setShowDeleteDialog(true); }}
                  className="block w-full text-left px-4 py-2 font-garamond text-base text-crimson hover:bg-navy-light transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post text */}
      <p className="font-garamond text-base text-text-light leading-relaxed mt-3">
        {post.text}
      </p>

      {/* Optional image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post image"
          className="rounded-md max-h-96 w-full object-cover mt-3"
        />
      )}

      {/* Link preview */}
      {post.linkPreview && <LinkPreviewCard preview={post.linkPreview} />}

      {/* Like error toast */}
      {likeError && (
        <p className="font-garamond text-xs italic text-crimson mt-2">{likeError}</p>
      )}

      {/* Bottom row: category chip + like + comment count */}
      <div className="flex items-center justify-between mt-3">
        <span className="bg-navy-light border border-gold/[0.15] font-cinzel text-xs uppercase tracking-widest text-gold-dim px-2 py-0.5 rounded-full">
          {post.category}
        </span>

        <div className="flex items-center gap-4">
          {/* Like button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-gold/60 rounded ${
              isLiked ? 'text-gold' : 'text-text-mid hover:text-gold'
            }`}
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart
              size={18}
              className={isLiked ? 'fill-current' : ''}
            />
            <span className="font-cinzel text-xs">{likeCount}</span>
          </button>

          {/* Comment count link */}
          <Link
            href={`/agora/${post.postId}`}
            className="flex items-center gap-1 text-text-mid hover:text-gold transition-colors"
            aria-label={`View ${post.commentCount} comments`}
          >
            <MessageCircle size={18} />
            <span className="font-cinzel text-xs">{post.commentCount}</span>
          </Link>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-8 max-w-sm w-full mx-4">
            <p className="font-garamond text-base text-text-light mb-6">
              Delete this post? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteLoading}
              >
                Keep
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleDelete}
                loading={deleteLoading}
                className="bg-crimson hover:bg-crimson border-crimson text-white hover:brightness-110"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
