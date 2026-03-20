'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase/client';

interface MessagesIconProps {
  uid: string;
}

export function MessagesIcon({ uid }: MessagesIconProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const q = query(
      collection(db, 'conversations'),
      where('participantUids', 'array-contains', uid),
    );

    const unsub = onSnapshot(q, (snap) => {
      // Filter client-side: Firestore dynamic map field paths don't use standard indexes
      // Do NOT use where('unreadCounts.${uid}', '>', 0)
      const count = snap.docs.filter((d) => (d.data().unreadCounts?.[uid] ?? 0) > 0).length;
      setUnreadCount(count);
    });

    return () => unsub();
  }, [uid]);

  const ariaLabel =
    unreadCount > 0 ? `Messages, ${unreadCount} unread` : 'Messages, no unread';

  return (
    <Link
      href="/messages"
      className="relative w-11 h-11 flex items-center justify-center text-text-mid hover:text-gold transition-colors"
      aria-label={ariaLabel}
    >
      <Mail size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-gold text-navy font-cinzel text-xs font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
