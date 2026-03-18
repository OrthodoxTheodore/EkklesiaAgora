'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getJurisdictionLabel } from '@/lib/constants/jurisdictions';
import type { UserProfile } from '@/lib/types/social';
import { blockUser, muteUser, reportContent } from '@/app/actions/moderation';
import { followUser, unfollowUser } from '@/app/actions/follows';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  currentUserUid: string;
  onFollow?: () => Promise<void>;
  onUnfollow?: () => Promise<void>;
}

const REPORT_REASONS = ['Spam', 'Harassment', 'Inappropriate content', 'Other'];

export function ProfileHeader({
  profile,
  isOwnProfile,
  isFollowing: initialIsFollowing,
  currentUserUid,
  onFollow,
  onUnfollow,
}: ProfileHeaderProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  function showToastMessage(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  const handleFollow = async () => {
    if (followLoading) return;
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowLoading(true);
    try {
      if (prev) {
        if (onUnfollow) {
          await onUnfollow();
        } else {
          const result = await unfollowUser(currentUserUid, profile.uid);
          if (!result.success) throw new Error('unfollowUser failed');
        }
      } else {
        if (onFollow) {
          await onFollow();
        } else {
          const result = await followUser(currentUserUid, profile.uid);
          if (!result.success) throw new Error('followUser failed');
        }
      }
    } catch {
      // Rollback on failure
      setIsFollowing(prev);
      showToastMessage('Could not follow. Try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  async function handleBlock() {
    setShowBlockConfirm(false);
    setOverflowOpen(false);
    await blockUser(currentUserUid, profile.uid);
    router.push('/agora');
  }

  async function handleMute() {
    setOverflowOpen(false);
    await muteUser(currentUserUid, profile.uid);
    showToastMessage(`Muted ${profile.displayName}. Their posts will be hidden from your feed.`);
  }

  async function handleReport() {
    if (!selectedReason) return;
    setShowReportSheet(false);
    await reportContent(currentUserUid, {
      contentType: 'user',
      contentId: profile.uid,
      reason: selectedReason,
    });
    showToastMessage('Report submitted. Thank you.');
    setSelectedReason('');
  }

  const initial = profile.displayName?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] bg-navy-mid border border-gold/20 rounded shadow-xl px-4 py-2 font-garamond text-sm text-text-light">
          {toast}
        </div>
      )}

      {/* Banner */}
      <div className="relative h-[140px] md:h-[200px]">
        {profile.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.bannerUrl}
            alt={`${profile.displayName}'s banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-navy-mid relative overflow-hidden">
            {/* Byzantine tile fallback */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('/Ekklesia_Agora.jpg')`,
                backgroundRepeat: 'repeat',
                backgroundSize: '120px',
                opacity: 0.08,
              }}
            />
          </div>
        )}

        {/* Avatar — overlapping banner bottom by 40px */}
        <div className="absolute -bottom-10 left-6">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={`${profile.displayName}'s avatar`}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gold/40 object-cover bg-navy-light"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gold/40 bg-navy-light flex items-center justify-center">
              <span className="font-cinzel text-gold text-xl md:text-2xl font-semibold">
                {initial}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile body */}
      <div className="px-6 pt-12 pb-6">
        {/* Display name */}
        <h1 className="font-cinzel text-[28px] text-gold font-semibold leading-tight">
          {profile.displayName}
        </h1>

        {/* @handle */}
        <p className="font-cinzel text-xs text-text-mid mt-0.5">@{profile.handle}</p>

        {/* Jurisdiction badge */}
        {profile.jurisdictionId && (
          <div className="mt-2">
            <span className="font-cinzel text-xs text-gold-dim border border-gold/[0.15] px-2 py-0.5 rounded-full inline-block">
              {getJurisdictionLabel(profile.jurisdictionId)}
            </span>
          </div>
        )}

        {/* Patron saint */}
        {profile.patronSaint && (
          <p className="font-garamond text-base text-text-mid italic mt-1">
            Patron: St. {profile.patronSaint}
          </p>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="mt-2">
            <p
              className={`font-garamond text-base text-text-light ${!bioExpanded ? 'line-clamp-2' : ''}`}
            >
              {profile.bio}
            </p>
            {profile.bio.length > 100 && (
              <button
                onClick={() => setBioExpanded(!bioExpanded)}
                className="font-cinzel text-xs text-gold-dim hover:text-gold mt-1 transition-colors"
              >
                {bioExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex gap-4 mt-4">
          <span className="font-cinzel text-xs uppercase text-text-mid">
            <span className="text-text-light">{profile.postCount}</span> Posts
          </span>
          <span className="font-cinzel text-xs uppercase text-text-mid">
            <span className="text-text-light">{profile.followerCount}</span> Followers
          </span>
          <span className="font-cinzel text-xs uppercase text-text-mid">
            <span className="text-text-light">{profile.followingCount}</span> Following
          </span>
        </div>

        {/* Actions row */}
        <div className="mt-4 flex gap-3 items-center">
          {isOwnProfile ? (
            <Link href="/profile/edit">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
          ) : (
            <>
              {/* Follow / Unfollow button */}
              <Button
                variant={isFollowing ? 'outline' : 'gold'}
                size="sm"
                loading={followLoading}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>

              {/* Message button — disabled, coming soon */}
              <Button
                variant="outline"
                size="sm"
                disabled
                title="Direct messaging coming soon"
              >
                Message
              </Button>

              {/* Three-dot overflow menu */}
              <div className="relative ml-auto">
                <button
                  aria-label="Profile options"
                  onClick={() => setOverflowOpen(!overflowOpen)}
                  className="font-cinzel text-text-mid hover:text-text-light px-2 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  •••
                </button>
                {overflowOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-navy-mid border border-gold/[0.15] rounded-md shadow-lg z-10">
                    <button
                      className="w-full text-left px-4 py-2.5 font-garamond text-base text-text-light hover:bg-navy-light transition-colors"
                      onClick={() => {
                        setOverflowOpen(false);
                        setShowBlockConfirm(true);
                      }}
                    >
                      Block
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 font-garamond text-base text-text-light hover:bg-navy-light transition-colors"
                      onClick={handleMute}
                    >
                      Mute
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 font-garamond text-base text-text-mid hover:bg-navy-light transition-colors"
                      onClick={() => {
                        setOverflowOpen(false);
                        setShowReportSheet(true);
                      }}
                    >
                      Report User
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Block confirmation dialog */}
      {showBlockConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBlockConfirm(false);
          }}
        >
          <div className="bg-navy-mid border border-gold/20 rounded shadow-2xl p-6 w-full max-w-sm mx-4">
            <p className="font-garamond text-base text-text-light mb-6">
              Block {profile.displayName}? They won&apos;t be able to see your posts or follow you.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBlockConfirm(false)}
              >
                Don&apos;t Block
              </Button>
              <button
                onClick={handleBlock}
                className="px-4 py-1.5 font-cinzel text-xs uppercase tracking-widest rounded bg-crimson text-white hover:opacity-90 transition-opacity"
              >
                Block {profile.displayName}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report sheet */}
      {showReportSheet && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReportSheet(false);
          }}
        >
          <div className="bg-navy-mid border border-gold/20 rounded-t-xl shadow-2xl p-6 w-full max-w-sm">
            <h2 className="font-cinzel text-xs uppercase tracking-widest text-gold mb-4">
              Report User
            </h2>
            <div className="flex flex-col gap-2 mb-6">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`text-left px-4 py-2 rounded font-garamond text-base transition-colors ${
                    selectedReason === reason
                      ? 'bg-gold/10 text-gold border border-gold/20'
                      : 'text-text-light hover:bg-navy-light'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReportSheet(false);
                  setSelectedReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                size="sm"
                disabled={!selectedReason}
                onClick={handleReport}
              >
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
