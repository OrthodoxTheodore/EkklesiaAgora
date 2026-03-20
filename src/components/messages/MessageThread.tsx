'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import firebaseApp from '@/lib/firebase/client';
import type { Message } from '@/lib/types/messages';
import { markConversationRead } from '@/app/actions/messages';

function formatTime(timestamp: { toDate?: () => Date } | null | undefined): string {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date();
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

interface MessageThreadProps {
  conversationId: string;
  currentUid: string;
  initialMessages?: Message[];
}

export function MessageThread({
  conversationId,
  currentUid,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Real-time listener for messages
  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(
        (d) => ({ messageId: d.id, ...d.data() }) as Message,
      );
      setMessages(msgs);
    });

    return () => unsub();
  }, [conversationId]);

  // Mark conversation as read on mount
  useEffect(() => {
    void markConversationRead(conversationId);
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: isInitialLoad.current ? 'instant' : 'smooth',
      });
      isInitialLoad.current = false;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-mid font-garamond text-base">
          No messages yet. Say hello.
        </p>
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg) => {
        const isSent = msg.senderUid === currentUid;

        return (
          <div key={msg.messageId}>
            {isSent ? (
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-gold/20 rounded-lg px-4 py-2">
                  <p className="text-text-light font-garamond text-base">{msg.text}</p>
                  <span className="text-text-mid text-xs font-cinzel block text-right mt-1">
                    {formatTime(msg.createdAt as { toDate?: () => Date } | null | undefined)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="max-w-[70%] bg-navy-mid rounded-lg px-4 py-2">
                  <p className="text-text-light font-garamond text-base">{msg.text}</p>
                  <span className="text-text-mid text-xs font-cinzel block mt-1">
                    {formatTime(msg.createdAt as { toDate?: () => Date } | null | undefined)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Seen indicator: show after last sent message if it has been seen */}
      {lastMessage?.senderUid === currentUid && (lastMessage?.seenBy?.length ?? 0) > 0 && (
        <p className="text-right text-text-mid text-xs font-cinzel mt-1">Seen</p>
      )}

      {/* Bottom anchor for scroll */}
      <div ref={scrollRef}></div>
    </div>
  );
}
