'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { sendMessage } from '@/app/actions/messages';

interface MessageComposerProps {
  conversationId: string;
  onSend?: () => void;
}

export function MessageComposer({ conversationId, onSend }: MessageComposerProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, text);
      setText('');
      onSend?.();
    } catch (err) {
      console.error('sendMessage error:', err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t border-gold/[0.15] bg-navy-mid"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 bg-navy border border-gold/[0.15] rounded px-3 py-2 text-text-light font-garamond text-base min-h-[44px] focus-visible:ring-1 focus-visible:ring-gold/60 focus-visible:outline-none placeholder:text-text-mid"
        disabled={sending}
      />
      <button
        type="submit"
        disabled={!text.trim() || sending}
        className="w-11 h-11 flex items-center justify-center text-text-mid hover:text-gold transition-colors disabled:opacity-40"
        aria-label="Send"
      >
        <Send size={20} />
      </button>
    </form>
  );
}
