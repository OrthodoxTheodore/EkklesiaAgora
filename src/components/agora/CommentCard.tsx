'use client';

import React, { useState } from 'react';
import { editComment, deleteComment } from '@/app/actions/comments';
import { Button } from '@/components/ui/Button';
import type { Comment } from '@/lib/types/social';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── CommentCard ─────────────────────────────────────────────────────────────

interface CommentCardProps {
  comment: Comment;
  currentUserUid: string;
  postId: string;
  onCommentDeleted?: (commentId: string) => void;
  onCommentEdited?: (commentId: string, newText: string) => void;
}

/**
 * Individual comment card.
 * Per UI-SPEC: simpler than PostCard — no image, no category chip, no jurisdiction badge.
 * Shows avatar, @handle, timestamp, edited marker, comment text, and edit/delete actions.
 */
export default function CommentCard({
  comment,
  currentUserUid,
  postId,
  onCommentDeleted,
  onCommentEdited,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isOwnComment = comment.authorUid === currentUserUid;

  async function handleEditSave() {
    if (!editText.trim() || editLoading) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const result = await editComment(currentUserUid, postId, comment.commentId, editText.trim());
      if (result.success) {
        setIsEditing(false);
        onCommentEdited?.(comment.commentId, editText.trim());
      } else {
        setEditError(result.error ?? 'Failed to save changes.');
      }
    } catch {
      setEditError('Failed to save changes.');
    } finally {
      setEditLoading(false);
    }
  }

  function handleEditCancel() {
    setIsEditing(false);
    setEditText(comment.text);
    setEditError(null);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteComment(currentUserUid, postId, comment.commentId);
      setShowDeleteDialog(false);
      onCommentDeleted?.(comment.commentId);
    } catch {
      setDeleteLoading(false);
    }
  }

  const createdAtTs = comment.createdAt as unknown as { seconds: number } | null;

  return (
    <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-4">
      {/* Header row: avatar + handle + timestamp + edited marker */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Avatar (28px circle) */}
        {comment.authorAvatarUrl ? (
          <img
            src={comment.authorAvatarUrl}
            alt={`${comment.authorDisplayName}'s avatar`}
            className="w-7 h-7 rounded-full border border-gold/[0.15] flex-shrink-0 object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full border border-gold/[0.15] flex-shrink-0 bg-gold-dim flex items-center justify-center">
            <span className="font-cinzel text-xs text-navy font-semibold uppercase">
              {comment.authorDisplayName.charAt(0) || comment.authorHandle.charAt(0)}
            </span>
          </div>
        )}

        {/* Handle */}
        <span className="font-cinzel text-xs text-text-mid">
          @{comment.authorHandle}
        </span>

        {/* Relative timestamp */}
        <span className="font-cinzel text-xs text-text-mid">
          {formatRelativeTime(createdAtTs)}
        </span>

        {/* Edited marker */}
        {comment.isEdited && (
          <span className="font-garamond text-xs italic text-text-mid">edited</span>
        )}
      </div>

      {/* Comment text or inline edit */}
      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full bg-navy-light border border-gold/[0.15] rounded-md p-3 font-garamond text-base text-text-light placeholder:text-text-mid focus:outline-none focus:border-gold/40 resize-none transition-colors"
          />
          {editError && (
            <p className="font-garamond text-xs italic text-crimson mt-1">{editError}</p>
          )}
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={handleEditSave}
              loading={editLoading}
              disabled={!editText.trim()}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEditCancel}
              disabled={editLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="font-garamond text-base text-text-light mt-2 leading-relaxed">
          {comment.text}
        </p>
      )}

      {/* Edit / Delete actions (own comments only) */}
      {isOwnComment && !isEditing && (
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => setIsEditing(true)}
            className="font-cinzel text-xs text-text-mid hover:text-text-light transition-colors focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="font-cinzel text-xs text-text-mid hover:text-crimson transition-colors focus-visible:ring-2 focus-visible:ring-gold/60 rounded"
          >
            Delete
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-8 max-w-sm w-full mx-4">
            <p className="font-garamond text-base text-text-light mb-6">
              Delete this comment? This cannot be undone.
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
                className="bg-crimson hover:brightness-110 border-crimson text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
