'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  getFirestore,
} from 'firebase/firestore';
import firebaseApp from '@/lib/firebase/client';
import type { Notification } from '@/lib/types/social';
import { markNotificationsRead, markSingleNotificationRead } from '@/app/actions/notifications';

interface NotificationBellProps {
  uid: string;
}

function formatRelativeTime(timestamp: { toDate?: () => Date } | null | undefined): string {
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

function getNotificationMessage(notification: Notification): string {
  switch (notification.type) {
    case 'like':
      return `liked your post${notification.postText ? ': "' + notification.postText.slice(0, 40) + '"' : ''}`;
    case 'comment':
      return `commented on your post`;
    case 'follow':
      return `started following you`;
    case 'mention':
      return `mentioned you in a post`;
    default:
      return 'interacted with your content';
  }
}

function getNotificationLink(notification: Notification): string {
  if (notification.type === 'follow') {
    return `/profile/${notification.fromHandle}`;
  }
  if (notification.postId) {
    return `/agora/${notification.postId}`;
  }
  return '/agora';
}

export function NotificationBell({ uid }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Real-time listener for unread notifications
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const notificationsRef = collection(db, 'users', uid, 'notifications');
    const q = query(
      notificationsRef,
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50),
    );

    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(
        (d) => ({ notificationId: d.id, ...d.data() }) as Notification,
      );
      setNotifications(notifs);
      setUnreadCount(snap.size);
    });

    return () => unsub();
  }, [uid]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleMarkAllRead() {
    await markNotificationsRead(uid);
  }

  async function handleNotificationClick(notification: Notification) {
    setDropdownOpen(false);
    await markSingleNotificationRead(uid, notification.notificationId);
    router.push(getNotificationLink(notification));
  }

  const ariaLabel =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : 'Notifications, no unread';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button — 44px touch target */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label={ariaLabel}
        className="relative flex items-center justify-center w-11 h-11 text-text-light hover:text-gold transition-colors focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:outline-none rounded"
      >
        <Bell size={24} />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-gold text-navy font-cinzel text-xs font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-navy-mid border border-gold/20 rounded shadow-xl z-60">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gold/[0.10] sticky top-0 bg-navy-mid">
            <span className="font-cinzel text-xs uppercase tracking-widest text-gold">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="font-cinzel text-xs text-text-mid hover:text-gold cursor-pointer transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification items */}
          {notifications.length === 0 ? (
            /* Empty state */
            <div className="py-8 px-4 text-center">
              <p className="font-garamond text-sm text-text-mid font-semibold mb-1">
                No notifications yet
              </p>
              <p className="font-garamond text-sm text-text-mid">
                You&apos;ll see likes, comments, follows, and mentions here.
              </p>
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification.notificationId}>
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-navy-light transition-colors ${
                      !notification.read ? 'bg-navy-light/50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full border border-gold/[0.15] bg-gold-dim flex items-center justify-center shrink-0 overflow-hidden">
                      {notification.fromAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={notification.fromAvatarUrl}
                          alt={`${notification.fromDisplayName}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-cinzel text-navy text-xs font-bold">
                          {notification.fromDisplayName[0]?.toUpperCase() ?? '?'}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                      <p className="font-garamond text-sm leading-snug">
                        <span className="text-text-light font-semibold">
                          {notification.fromDisplayName}
                        </span>{' '}
                        <span className="text-text-mid">
                          {getNotificationMessage(notification)}
                        </span>
                      </p>
                      <p className="font-cinzel text-xs text-text-mid mt-0.5">
                        {formatRelativeTime(
                          notification.createdAt as { toDate?: () => Date } | null | undefined,
                        )}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
