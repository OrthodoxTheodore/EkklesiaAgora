'use client';

import React, { useState } from 'react';
import { Heart, Share2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { likeVideo } from '@/app/actions/videos';
import { reportContent } from '@/app/actions/moderation';
import { createVideoComment, deleteVideoComment } from '@/app/actions/videoComments';
import type { VideoComment } from '@/lib/types/video';

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

// ─── Flag Dialog ─────────────────────────────────────────────────────────────

const FLAG_REASONS = [
  'Spam',
  'Harassment',
  'Inappropriate content',
  'Other',
] as const;

interface FlagDialogProps {
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

function FlagDialog({ onClose, onSubmit }: FlagDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReason) return;
    setLoading(true);
    await onSubmit(selectedReason);
    setLoading(false);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flag-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-8 max-w-sm w-full mx-4">
        <h2 id="flag-dialog-title" className="font-cinzel text-base text-text-light mb-4">
          Report Video
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {FLAG_REASONS.map((reason) => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="accent-gold"
              />
              <span className="font-garamond text-base text-text-light">{reason}</span>
            </label>
          ))}
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              type="submit"
              loading={loading}
              disabled={!selectedReason}
            >
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Comment Item ────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: VideoComment;
  currentUserUid: string | null;
  videoId: string;
  onDeleted: (commentId: string) => void;
}

function CommentItem({ comment, currentUserUid, videoId, onDeleted }: CommentItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isAuthor = currentUserUid === comment.authorUid;

  async function handleDelete() {
    if (!currentUserUid) return;
    setDeleteLoading(true);
    const result = await deleteVideoComment(currentUserUid, videoId, comment.commentId);
    if (result.success) {
      onDeleted(comment.commentId);
    }
    setDeleteLoading(false);
    setShowDeleteConfirm(false);
  }

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      {comment.authorAvatarUrl ? (
        <img
          src={comment.authorAvatarUrl}
          alt={comment.authorDisplayName}
          className="w-8 h-8 rounded-full border border-gold/[0.15] object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full border border-gold/[0.15] bg-gold-dim flex items-center justify-center flex-shrink-0">
          <span className="font-cinzel text-xs text-navy font-semibold uppercase">
            {comment.authorDisplayName.charAt(0)}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-cinzel text-xs text-text-light">{comment.authorDisplayName}</span>
          <span className="font-cinzel text-xs text-text-mid">@{comment.authorHandle}</span>
          <span className="font-cinzel text-xs text-text-mid">
            {formatRelativeTime(comment.createdAt as unknown as { seconds: number })}
          </span>
          {comment.isEdited && (
            <span className="font-garamond text-xs italic text-text-mid">edited</span>
          )}
        </div>
        <p className="font-garamond text-base text-text-light leading-relaxed mt-1">
          {comment.text}
        </p>

        {/* Delete (author only) */}
        {isAuthor && !showDeleteConfirm && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="font-cinzel text-xs text-text-mid hover:text-crimson transition-colors mt-1"
          >
            Delete
          </button>
        )}
        {showDeleteConfirm && (
          <div className="flex items-center gap-2 mt-1">
            <span className="font-garamond text-xs text-text-mid">Delete this comment?</span>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="font-cinzel text-xs text-crimson hover:brightness-110 transition-colors"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="font-cinzel text-xs text-text-mid hover:text-text-light transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VideoDetailClient ────────────────────────────────────────────────────────

interface VideoDetailClientProps {
  videoId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  commentCount: number;
  currentUserUid: string | null;
  currentUserRoleLevel: number;
  initialComments: VideoComment[];
}

export default function VideoDetailClient({
  videoId,
  initialLiked,
  initialLikeCount,
  commentCount: initialCommentCount,
  currentUserUid,
  currentUserRoleLevel,
  initialComments,
}: VideoDetailClientProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [comments, setComments] = useState<VideoComment[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // ── Like ──────────────────────────────────────────────────────────────────

  async function handleLike() {
    if (!currentUserUid) return;
    setLikeError(null);
    const prevLiked = isLiked;
    const prevCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const result = await likeVideo(videoId, currentUserUid);
      if ('error' in result) {
        setIsLiked(prevLiked);
        setLikeCount(prevCount);
        setLikeError("Couldn't update like. Please try again.");
      }
    } catch {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      setLikeError("Couldn't update like. Please try again.");
    }
  }

  // ── Share ─────────────────────────────────────────────────────────────────

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    } catch {
      // Fallback: do nothing silently
    }
  }

  // ── Flag ──────────────────────────────────────────────────────────────────

  async function handleFlag(reason: string) {
    if (!currentUserUid) return;
    await reportContent(currentUserUid, {
      contentType: 'video',
      contentId: videoId,
      reason,
    });
  }

  // ── Comment submit ────────────────────────────────────────────────────────

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserUid || !commentText.trim()) return;
    setCommentLoading(true);
    setCommentError(null);

    const result = await createVideoComment(currentUserUid, videoId, commentText.trim());
    if (result.success) {
      // Optimistically add comment — server will return fresh data on next load
      const optimisticComment: VideoComment = {
        commentId: result.commentId,
        videoId,
        authorUid: currentUserUid,
        authorHandle: '',
        authorDisplayName: 'You',
        authorAvatarUrl: null,
        text: commentText.trim(),
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as unknown as import('firebase/firestore').Timestamp,
        updatedAt: null,
        isEdited: false,
      };
      setComments((prev) => [...prev, optimisticComment]);
      setCommentText('');
    } else {
      setCommentError(result.error);
    }

    setCommentLoading(false);
  }

  function handleCommentDeleted(commentId: string) {
    setComments((prev) => prev.filter((c) => c.commentId !== commentId));
  }

  const canComment = !!currentUserUid && currentUserRoleLevel >= 1;

  return (
    <div className="space-y-6">
      {/* ── Action row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={!currentUserUid}
          className={`flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-gold/60 rounded ${
            isLiked ? 'text-gold' : 'text-text-mid hover:text-gold'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isLiked ? 'Unlike video' : 'Like video'}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          <span className="font-cinzel text-xs">{likeCount}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-text-mid hover:text-gold transition-colors focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
          aria-label="Copy link to video"
        >
          <Share2 size={20} />
          <span className="font-cinzel text-xs">Share</span>
        </button>

        {/* Flag */}
        <button
          onClick={() => setShowFlagDialog(true)}
          disabled={!currentUserUid}
          className="flex items-center gap-1.5 text-text-mid hover:text-crimson transition-colors focus-visible:ring-2 focus-visible:ring-gold/60 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Report video"
        >
          <Flag size={20} />
          <span className="font-cinzel text-xs">Report</span>
        </button>

        {/* Share toast */}
        {shareToast && (
          <span className="font-cinzel text-xs text-gold animate-pulse">Link copied!</span>
        )}

        {/* Like error */}
        {likeError && (
          <span className="font-garamond text-xs italic text-crimson">{likeError}</span>
        )}
      </div>

      {/* ── Comments section ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="font-cinzel text-base text-text-light">
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </h2>

        {/* Comment compose */}
        {canComment ? (
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              maxLength={2000}
              className="w-full bg-navy-mid border border-gold/[0.15] rounded-[6px] p-3 font-garamond text-base text-text-light placeholder-text-mid focus:outline-none focus:border-gold/40 transition-colors resize-none"
              aria-label="Write a comment"
            />
            {commentError && (
              <p className="font-garamond text-xs italic text-crimson">{commentError}</p>
            )}
            <div className="flex justify-end">
              <Button
                variant="gold"
                size="sm"
                type="submit"
                loading={commentLoading}
                disabled={!commentText.trim()}
              >
                Comment
              </Button>
            </div>
          </form>
        ) : !currentUserUid ? (
          <p className="font-garamond text-base text-text-mid">
            Sign in to leave a comment.
          </p>
        ) : null}

        {/* Comment list */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              currentUserUid={currentUserUid}
              videoId={videoId}
              onDeleted={handleCommentDeleted}
            />
          ))}
          {comments.length === 0 && (
            <p className="font-garamond text-base text-text-mid">
              No comments yet. Be the first to share your thoughts.
            </p>
          )}
        </div>
      </div>

      {/* ── Flag dialog ────────────────────────────────────────────────────── */}
      {showFlagDialog && (
        <FlagDialog
          onClose={() => setShowFlagDialog(false)}
          onSubmit={handleFlag}
        />
      )}
    </div>
  );
}
