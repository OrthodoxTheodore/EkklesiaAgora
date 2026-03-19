'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import ModerationReviewCard from '@/components/video/ModerationReviewCard';
import FlaggedContentCard from '@/components/video/FlaggedContentCard';
import { updateVideoStatus } from '@/app/actions/videos';
import { approveChannel, rejectChannel } from '@/app/actions/channels';
import type { Video, Channel } from '@/lib/types/video';

interface FlaggedVideoData {
  video: Video;
  flagReasons: string[];
  flagCount: number;
}

interface PendingVideoData {
  video: Video;
  uploaderPostCount: number;
  uploaderAccountAgeDays: number;
}

interface ModerationConsoleClientProps {
  initialTab: 'pending' | 'flagged';
  initialPendingVideos: PendingVideoData[];
  initialFlaggedVideos: FlaggedVideoData[];
  initialChannelApplications: Channel[];
}

export default function ModerationConsoleClient({
  initialTab,
  initialPendingVideos,
  initialFlaggedVideos,
  initialChannelApplications,
}: ModerationConsoleClientProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'flagged'>(initialTab);
  const [pendingVideos, setPendingVideos] = useState(initialPendingVideos);
  const [flaggedVideos, setFlaggedVideos] = useState(initialFlaggedVideos);
  const [channelApplications, setChannelApplications] = useState(initialChannelApplications);
  const [channelActionLoading, setChannelActionLoading] = useState<string | null>(null);
  const [channelError, setChannelError] = useState<Record<string, string>>({});

  async function handleVideoAction(
    videoId: string,
    decision: 'published' | 'rejected' | 'changes_requested',
    note?: string
  ) {
    const result = await updateVideoStatus(videoId, decision, note);
    if ('error' in result) {
      throw new Error(result.error);
    }
    // Optimistic removal from pending list
    setPendingVideos((prev) => prev.filter((pv) => pv.video.videoId !== videoId));
    // Also remove from flagged list if present
    setFlaggedVideos((prev) => prev.filter((fv) => fv.video.videoId !== videoId));
  }

  async function handleChannelApprove(channelId: string) {
    setChannelActionLoading(channelId + ':approve');
    setChannelError((prev) => ({ ...prev, [channelId]: '' }));
    try {
      const result = await approveChannel(channelId);
      if ('error' in result) {
        setChannelError((prev) => ({ ...prev, [channelId]: result.error }));
      } else {
        setChannelApplications((prev) => prev.filter((c) => c.channelId !== channelId));
      }
    } catch {
      setChannelError((prev) => ({
        ...prev,
        [channelId]: 'Action could not be completed. Refresh the page and try again.',
      }));
    } finally {
      setChannelActionLoading(null);
    }
  }

  async function handleChannelReject(channelId: string) {
    setChannelActionLoading(channelId + ':reject');
    setChannelError((prev) => ({ ...prev, [channelId]: '' }));
    try {
      const result = await rejectChannel(channelId, 'Channel application rejected by moderator.');
      if ('error' in result) {
        setChannelError((prev) => ({ ...prev, [channelId]: result.error }));
      } else {
        setChannelApplications((prev) => prev.filter((c) => c.channelId !== channelId));
      }
    } catch {
      setChannelError((prev) => ({
        ...prev,
        [channelId]: 'Action could not be completed. Refresh the page and try again.',
      }));
    } finally {
      setChannelActionLoading(null);
    }
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-gold/[0.15] mb-8">
        <button
          onClick={() => setActiveTab('pending')}
          className={`font-cinzel text-sm uppercase tracking-widest px-4 py-3 transition-colors ${
            activeTab === 'pending'
              ? 'text-gold border-b-2 border-gold'
              : 'text-text-mid hover:text-text-light'
          }`}
        >
          Pending Uploads
          {pendingVideos.length > 0 && (
            <span className="ml-2 bg-gold text-navy font-cinzel text-xs px-1.5 py-0.5 rounded-full">
              {pendingVideos.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`font-cinzel text-sm uppercase tracking-widest px-4 py-3 transition-colors ${
            activeTab === 'flagged'
              ? 'text-gold border-b-2 border-gold'
              : 'text-text-mid hover:text-text-light'
          }`}
        >
          Flagged Content
          {flaggedVideos.length > 0 && (
            <span className="ml-2 bg-crimson text-white font-cinzel text-xs px-1.5 py-0.5 rounded-full">
              {flaggedVideos.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending Uploads tab */}
      {activeTab === 'pending' && (
        <div>
          {/* Pending Videos */}
          {pendingVideos.length === 0 && channelApplications.length === 0 ? (
            <div className="py-16 text-center">
              <h2 className="font-cinzel text-xl font-bold text-text-light mb-2">
                Queue is Clear
              </h2>
              <p className="font-garamond text-base text-text-mid">
                No uploads are awaiting review. Check back after new content is submitted.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingVideos.map((pv) => (
                <ModerationReviewCard
                  key={pv.video.videoId}
                  video={pv.video}
                  uploaderPostCount={pv.uploaderPostCount}
                  uploaderAccountAgeDays={pv.uploaderAccountAgeDays}
                  onAction={handleVideoAction}
                />
              ))}

              {/* Channel Applications section */}
              {channelApplications.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-cinzel text-xl font-bold text-text-light mb-6">
                    Channel Applications
                  </h2>
                  <div className="space-y-4">
                    {channelApplications.map((channel) => (
                      <div
                        key={channel.channelId}
                        className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-6"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-cinzel text-base font-bold text-text-light mb-1">
                              {channel.name}
                            </h3>
                            <p className="font-cinzel text-xs text-text-mid mb-1">
                              @{channel.handle}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              <span className="bg-navy-light border border-gold/[0.15] font-cinzel text-xs text-gold-dim px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {channel.channelType}
                              </span>
                              <span className="bg-navy-light border border-gold/[0.15] font-cinzel text-xs text-gold-dim px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {channel.primaryCategory}
                              </span>
                            </div>
                          </div>
                        </div>

                        {channel.description && (
                          <p className="font-garamond text-base text-text-light leading-relaxed mb-4">
                            {channel.description}
                          </p>
                        )}

                        {channelError[channel.channelId] && (
                          <p className="font-garamond text-base text-crimson mb-3">
                            {channelError[channel.channelId]}
                          </p>
                        )}

                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChannelReject(channel.channelId)}
                            loading={channelActionLoading === channel.channelId + ':reject'}
                            disabled={channelActionLoading !== null}
                            className="text-crimson border-crimson hover:bg-crimson/10"
                          >
                            Reject
                          </Button>
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => handleChannelApprove(channel.channelId)}
                            loading={channelActionLoading === channel.channelId + ':approve'}
                            disabled={channelActionLoading !== null}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Flagged Content tab */}
      {activeTab === 'flagged' && (
        <div>
          {flaggedVideos.length === 0 ? (
            <div className="py-16 text-center">
              <h2 className="font-cinzel text-xl font-bold text-text-light mb-2">
                No Flagged Content
              </h2>
              <p className="font-garamond text-base text-text-mid">
                No content has been reported. The community is in good order.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {flaggedVideos.map((fv) => (
                <FlaggedContentCard
                  key={fv.video.videoId}
                  video={fv.video}
                  flagReasons={fv.flagReasons}
                  flagCount={fv.flagCount}
                  onAction={handleVideoAction}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
