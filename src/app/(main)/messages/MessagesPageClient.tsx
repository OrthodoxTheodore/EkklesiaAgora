'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Conversation } from '@/lib/types/messages';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { updateLastSeen } from '@/app/actions/messages';

interface MessagesPageClientProps {
  conversations: Conversation[];
  currentUid: string;
  lastSeenMap: Record<string, number | null>;
  activeConversationId?: string;
}

export function MessagesPageClient({
  conversations,
  currentUid,
  lastSeenMap,
  activeConversationId: initialActiveId,
}: MessagesPageClientProps) {
  const router = useRouter();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(
    initialActiveId,
  );

  // Update last seen on mount and on window focus
  useEffect(() => {
    void updateLastSeen();

    function handleFocus() {
      void updateLastSeen();
    }

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  function handleSelectConversation(id: string) {
    setActiveConversationId(id);
    // On mobile, navigate to the full-page thread
    if (window.innerWidth < 768) {
      router.push(`/messages/${id}`);
    }
  }

  return (
    <div className="flex h-screen pt-[70px]">
      {/* Left sidebar — conversation list */}
      <aside className="hidden md:flex md:flex-col w-[300px] min-w-[280px] max-w-[320px] bg-navy-mid border-r border-gold/[0.15] overflow-y-auto">
        <div className="px-4 py-3 border-b border-gold/[0.15]">
          <h1 className="font-cinzel text-sm uppercase tracking-widest text-gold">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            currentUid={currentUid}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            lastSeenMap={lastSeenMap}
          />
        </div>
      </aside>

      {/* Mobile: show conversation list only */}
      <div className="flex-1 flex flex-col md:hidden bg-navy overflow-hidden">
        <div className="px-4 py-3 border-b border-gold/[0.15] bg-navy-mid">
          <h1 className="font-cinzel text-sm uppercase tracking-widest text-gold">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            currentUid={currentUid}
            onSelectConversation={handleSelectConversation}
            lastSeenMap={lastSeenMap}
          />
        </div>
      </div>

      {/* Right panel — message thread (desktop only) */}
      <main className="hidden md:flex flex-1 flex-col bg-navy overflow-hidden">
        {activeConversationId ? (
          <>
            <MessageThread
              conversationId={activeConversationId}
              currentUid={currentUid}
            />
            <MessageComposer conversationId={activeConversationId} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-mid font-garamond text-base">
              Select a conversation to start messaging.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
