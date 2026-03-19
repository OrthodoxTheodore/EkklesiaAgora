'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import VideoPlayer from './VideoPlayer';
import { Button } from '@/components/ui/Button';
import { getJurisdictionLabel } from '@/lib/constants/jurisdictions';
import type { Video } from '@/lib/types/video';

interface ModerationReviewCardProps {
  video: Video;
  uploaderPostCount?: number;
  uploaderAccountAgeDays?: number;
  onAction: (
    videoId: string,
    decision: 'published' | 'rejected' | 'changes_requested',
    note?: string
  ) => Promise<void>;
}

function getRoleBadge(roleLevel: number): string {
  if (roleLevel >= 4) return 'Super Admin';
  if (roleLevel >= 3) return 'Admin';
  if (roleLevel >= 2) return 'Moderator';
  if (roleLevel >= 1) return 'Registered';
  return 'Guest';
}

export default function ModerationReviewCard({
  video,
  uploaderPostCount,
  uploaderAccountAgeDays,
  onAction,
}: ModerationReviewCardProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showChangesTextarea, setShowChangesTextarea] = useState(false);
  const [changeNote, setChangeNote] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const jurisdictionLabel = video.uploaderJurisdictionId
    ? getJurisdictionLabel(video.uploaderJurisdictionId)
    : null;

  async function handleApprove() {
    setError(null);
    setActionLoading('approve');
    try {
      await onAction(video.videoId, 'published');
    } catch {
      setError('Action could not be completed. Refresh the page and try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRequestChanges() {
    if (!showChangesTextarea) {
      setShowChangesTextarea(true);
      return;
    }
    if (!changeNote.trim()) return;
    setError(null);
    setActionLoading('changes');
    try {
      await onAction(video.videoId, 'changes_requested', changeNote.trim());
    } catch {
      setError('Action could not be completed. Refresh the page and try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectConfirm() {
    setError(null);
    setActionLoading('reject');
    try {
      await onAction(video.videoId, 'rejected', rejectReason.trim() || undefined);
      setShowRejectDialog(false);
    } catch {
      setError('Action could not be completed. Refresh the page and try again.');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] overflow-hidden">
      {/* Full-width video player — no horizontal padding */}
      <VideoPlayer videoUrl={video.videoUrl} thumbnailUrl={video.thumbnailUrl} />

      <div className="p-6">
        {/* Title */}
        <h2 className="font-cinzel text-xl font-bold text-text-light mb-2">
          {video.title}
        </h2>

        {/* Description */}
        {video.description && (
          <p className="font-garamond text-base text-text-light leading-relaxed mb-4">
            {video.description}
          </p>
        )}

        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {video.tags.map((tag) => (
              <span
                key={tag}
                className="bg-navy-light border border-gold/[0.15] font-cinzel text-xs text-gold-dim px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Thumbnail preview */}
        {video.thumbnailUrl && (
          <div className="mb-4">
            <p className="font-cinzel text-xs text-text-mid mb-1 uppercase tracking-widest">Thumbnail</p>
            <img
              src={video.thumbnailUrl}
              alt="Video thumbnail"
              className="h-20 w-auto rounded-[6px] border border-gold/[0.15]"
            />
          </div>
        )}

        {/* Category chip */}
        <div className="mb-4">
          <span className="bg-navy-light border border-gold/[0.15] font-cinzel text-xs uppercase tracking-widest text-gold-dim px-2 py-0.5 rounded-full">
            {video.category}
          </span>
        </div>

        {/* Uploader context block */}
        <div className="bg-navy-light border border-gold/[0.15] rounded-[6px] p-4 mt-4">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            {video.uploaderAvatarUrl ? (
              <img
                src={video.uploaderAvatarUrl}
                alt={`${video.uploaderDisplayName}'s avatar`}
                className="w-10 h-10 rounded-full border border-gold/[0.15] object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border border-gold/[0.15] bg-gold-dim flex items-center justify-center flex-shrink-0">
                <span className="font-cinzel text-sm text-navy font-bold uppercase">
                  {video.uploaderDisplayName.charAt(0)}
                </span>
              </div>
            )}

            {/* Name + handle */}
            <div>
              <Link
                href={`/profile/${video.uploaderHandle}`}
                className="font-cinzel text-base text-text-light hover:text-gold transition-colors"
              >
                {video.uploaderDisplayName}
              </Link>
              <p className="font-cinzel text-xs text-text-mid">
                @{video.uploaderHandle}
              </p>
            </div>
          </div>

          {/* Jurisdiction badge */}
          {jurisdictionLabel && (
            <p className="font-cinzel text-xs text-gold-dim mb-1">
              &bull; {jurisdictionLabel}
            </p>
          )}

          {/* Account age */}
          {uploaderAccountAgeDays !== undefined && (
            <p className="font-cinzel text-xs text-text-mid mb-1">
              Account age: {uploaderAccountAgeDays} day{uploaderAccountAgeDays !== 1 ? 's' : ''}
            </p>
          )}

          {/* Post history count */}
          {uploaderPostCount !== undefined && (
            <p className="font-cinzel text-xs text-text-mid mb-1">
              Posts: {uploaderPostCount}
            </p>
          )}

          {/* Role badge */}
          <p className="font-cinzel text-xs text-text-mid">
            Role: {getRoleBadge(video.uploaderRoleLevel)}
          </p>
        </div>

        {/* Error state */}
        {error && (
          <p className="font-garamond text-base text-crimson mt-4">{error}</p>
        )}

        {/* Action row */}
        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestChanges}
            loading={actionLoading === 'changes'}
            disabled={actionLoading !== null && actionLoading !== 'changes'}
          >
            Request Changes
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => setShowRejectDialog(true)}
            disabled={actionLoading !== null}
            className="text-crimson border-crimson hover:bg-crimson/10 bg-transparent border from-transparent via-transparent to-transparent"
          >
            Reject
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={handleApprove}
            loading={actionLoading === 'approve'}
            disabled={actionLoading !== null && actionLoading !== 'approve'}
          >
            Approve
          </Button>
        </div>

        {/* Request Changes textarea */}
        {showChangesTextarea && (
          <div className="mt-3">
            <textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="Explain what needs to change..."
              rows={4}
              className="font-garamond text-base bg-navy-mid border border-gold/[0.15] rounded-[6px] p-3 w-full text-text-light placeholder-text-mid resize-none focus:outline-none focus:border-gold/40"
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="gold"
                size="sm"
                onClick={handleRequestChanges}
                loading={actionLoading === 'changes'}
                disabled={!changeNote.trim() || (actionLoading !== null && actionLoading !== 'changes')}
              >
                Send Note
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reject confirmation dialog */}
      {showRejectDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-8 max-w-sm w-full mx-4">
            <p className="font-garamond text-base text-text-light mb-4">
              Reject this video? The uploader will be notified and the video will be permanently removed.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              rows={3}
              className="font-garamond text-base bg-navy-light border border-gold/[0.15] rounded-[6px] p-3 w-full text-text-light placeholder-text-mid resize-none focus:outline-none focus:border-gold/40 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(false)}
                disabled={actionLoading === 'reject'}
              >
                Keep Video
              </Button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading === 'reject'}
                className="font-cinzel uppercase tracking-widest rounded transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 text-xs bg-transparent border border-crimson text-crimson hover:bg-crimson/10"
              >
                {actionLoading === 'reject' ? 'Rejecting...' : 'Reject Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
