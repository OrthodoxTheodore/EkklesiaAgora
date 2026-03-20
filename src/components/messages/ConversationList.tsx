'use client';

import React from 'react';
import type { Conversation } from '@/lib/types/messages';

function formatRelativeTime(
  timestamp: { toDate?: () => Date } | null | undefined,
): string {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ConversationListProps {
  conversations: Conversation[];
  currentUid: string;
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  lastSeenMap?: Record<string, number | null>;
}

export function ConversationList({
  conversations,
  currentUid,
  activeConversationId,
  onSelectConversation,
  lastSeenMap = {},
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center py-16">
        <p className="text-text-light font-cinzel text-sm">No conversations yet</p>
        <p className="text-text-mid font-garamond text-sm mt-2">
          Visit a member&apos;s profile and tap Message to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <ul>
      {conversations.map((conv) => {
        const otherUid = Object.keys(conv.participantProfiles).find(
          (uid) => uid !== currentUid,
        );
        const profile = otherUid ? conv.participantProfiles[otherUid] : null;

        if (!profile || !otherUid) return null;

        const lastSeenMs = lastSeenMap[otherUid] ?? null;
        const isOnline =
          lastSeenMs !== null && Date.now() - lastSeenMs < 5 * 60 * 1000;

        const unreadCount = conv.unreadCounts?.[currentUid] ?? 0;

        return (
          <li key={conv.conversationId}>
            <div
              onClick={() => onSelectConversation?.(conv.conversationId)}
              className={
                'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-navy-light transition-colors min-h-[44px] ' +
                (activeConversationId === conv.conversationId ? 'bg-navy-light' : '')
              }
            >
              {/* Avatar with online presence dot */}
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl || '/default-avatar.png'}
                  alt={profile.displayName}
                  className="w-10 h-10 rounded-full border border-gold/[0.15] object-cover"
                />
                {isOnline && (
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-navy-mid"
                    aria-label={`${profile.displayName} — active recently`}
                  ></span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-text-light text-sm font-bold font-garamond truncate">
                  {profile.displayName}
                </p>
                <p className="text-text-mid text-xs font-garamond truncate">
                  {conv.lastMessage || 'No messages yet'}
                </p>
              </div>

              {/* Right: timestamp + unread dot */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-text-mid text-xs font-cinzel">
                  {formatRelativeTime(
                    conv.lastMessageAt as { toDate?: () => Date } | null | undefined,
                  )}
                </span>
                {unreadCount > 0 && (
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
