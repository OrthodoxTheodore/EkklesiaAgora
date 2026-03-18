'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseApp from '@/lib/firebase/client';
import { createComment } from '@/app/actions/comments';
import { Button } from '@/components/ui/Button';
import CommentCard from '@/components/agora/CommentCard';
import type { Comment } from '@/lib/types/social';

interface PostDetailClientProps {
  postId: string;
  currentUserUid: string;
  commentsRestricted: 'all' | 'followers';
  isFollowing: boolean;
  isPostAuthor: boolean;
}

/**
 * Client component for the post detail page.
 * Loads all comments at once (no pagination per spec).
 * Handles comment compose with follower-only restriction.
 */
export default function PostDetailClient({
  postId,
  currentUserUid,
  commentsRestricted,
  isFollowing,
  isPostAuthor,
}: PostDetailClientProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load all comments on mount
  useEffect(() => {
    async function loadComments() {
      setLoading(true);
      try {
        const db = getFirestore(firebaseApp);
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));
        const snap = await getDocs(q);
        const loaded = snap.docs.map((d) => d.data() as Comment);
        setComments(loaded);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [postId]);

  // Dismiss toast after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Determine if compose area should be shown
  const canComment =
    currentUserUid &&
    (commentsRestricted === 'all' || isFollowing || isPostAuthor);

  const showFollowerRestrictionMessage =
    currentUserUid &&
    commentsRestricted === 'followers' &&
    !isFollowing &&
    !isPostAuthor;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    const textToSubmit = commentText.trim();
    setSubmitting(true);

    // Optimistic add: create a temporary comment
    const optimisticComment: Comment = {
      commentId: `optimistic-${Date.now()}`,
      postId,
      authorUid: currentUserUid,
      authorHandle: '',
      authorDisplayName: '',
      authorAvatarUrl: null,
      text: textToSubmit,
      createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as Comment['createdAt'],
      updatedAt: null,
      isEdited: false,
    };

    setComments((prev) => [...prev, optimisticComment]);
    setCommentText('');

    try {
      const result = await createComment(currentUserUid, postId, textToSubmit);
      if (!result.success) {
        // Rollback optimistic update
        setComments((prev) =>
          prev.filter((c) => c.commentId !== optimisticComment.commentId),
        );
        setCommentText(textToSubmit);
        setToast('Your comment could not be posted. Please try again.');
      } else {
        // Replace optimistic comment with real one (reload comments)
        const db = getFirestore(firebaseApp);
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));
        const snap = await getDocs(q);
        setComments(snap.docs.map((d) => d.data() as Comment));
      }
    } catch {
      // Rollback on network/unexpected error
      setComments((prev) =>
        prev.filter((c) => c.commentId !== optimisticComment.commentId),
      );
      setCommentText(textToSubmit);
      setToast('Your comment could not be posted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCommentDeleted(commentId: string) {
    setComments((prev) => prev.filter((c) => c.commentId !== commentId));
  }

  function handleCommentEdited(commentId: string, newText: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.commentId === commentId
          ? { ...c, text: newText, isEdited: true }
          : c,
      ),
    );
  }

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div
          role="alert"
          className="bg-navy-mid border border-crimson/40 rounded-md px-4 py-3 mb-4"
        >
          <p className="font-garamond text-base text-crimson">{toast}</p>
        </div>
      )}

      {/* Comment compose area */}
      {canComment && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            ref={textareaRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full bg-navy-light border border-gold/[0.15] rounded-md p-4 font-garamond text-base text-text-light placeholder:text-text-mid focus:outline-none focus:border-gold/40 resize-none min-h-[60px] transition-colors"
          />
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              variant="gold"
              size="sm"
              disabled={!commentText.trim()}
              loading={submitting}
            >
              Comment
            </Button>
          </div>
        </form>
      )}

      {/* Follower-only restriction message */}
      {showFollowerRestrictionMessage && (
        <div className="mb-6 bg-navy-mid border border-gold/[0.15] rounded-md px-4 py-3">
          <p className="font-garamond text-base text-text-mid">
            Only followers can comment on this post.
          </p>
        </div>
      )}

      {/* Sign-in prompt for guests (defensive — auth redirect should handle this) */}
      {!currentUserUid && (
        <div className="mb-6 bg-navy-mid border border-gold/[0.15] rounded-md px-4 py-3">
          <p className="font-garamond text-base text-text-mid">
            <a href="/login" className="text-gold hover:text-gold-bright underline">
              Sign in to join the conversation.
            </a>
          </p>
        </div>
      )}

      {/* Comment count heading */}
      <h2 className="font-cinzel text-sm uppercase tracking-widest text-text-mid mb-4">
        {loading ? 'Loading comments...' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
      </h2>

      {/* Comment list */}
      {!loading && comments.length === 0 && (
        <p className="font-garamond text-base text-text-mid text-center py-8">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      {!loading && (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.commentId}
              comment={comment}
              currentUserUid={currentUserUid}
              postId={postId}
              onCommentDeleted={handleCommentDeleted}
              onCommentEdited={handleCommentEdited}
            />
          ))}
        </div>
      )}
    </div>
  );
}
