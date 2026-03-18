'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface GuestPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Description of the action the guest attempted. E.g. "like this post" */
  action?: string;
}

/**
 * GuestPromptModal — shown when an unauthenticated user attempts an action
 * that requires a registered account (liking, commenting, posting, etc.).
 *
 * AUTH-05: Gentle nudge pattern — guest can browse freely but is prompted
 * to register when they try to interact.
 */
export function GuestPromptModal({ isOpen, onClose, action }: GuestPromptModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap: move focus into modal when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow modal to render before focusing
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const actionText = action || 'participate in the community';

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    // Only close if the click was directly on the overlay (not the modal card)
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-prompt-title"
      aria-describedby="guest-prompt-description"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/80 backdrop-blur-sm px-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative w-full max-w-md bg-navy-mid border border-gold/30 rounded-lg p-8 shadow-2xl"
        role="document"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-mid hover:text-gold transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Decorative gold divider line at top */}
        <div className="w-12 h-0.5 bg-gold-dim mb-6" aria-hidden="true" />

        {/* Heading */}
        <h2
          id="guest-prompt-title"
          className="font-cinzel text-gold text-xl uppercase tracking-widest mb-3"
        >
          Join the Community
        </h2>

        {/* Body */}
        <p
          id="guest-prompt-description"
          className="font-garamond text-text-mid text-base leading-relaxed mb-8"
        >
          Sign in to {actionText}.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            ref={firstFocusableRef}
            href="/login"
            className="flex-1"
            tabIndex={0}
          >
            <Button variant="gold" className="w-full" size="md">
              Sign In
            </Button>
          </Link>
          <Link
            href="/register"
            className="flex-1"
            tabIndex={0}
          >
            <Button variant="outline" className="w-full" size="md">
              Register
            </Button>
          </Link>
        </div>

        {/* Fine print */}
        <p className="font-garamond text-text-mid/60 text-sm text-center mt-4">
          Free to join. Orthodox community.
        </p>
      </div>
    </div>
  );
}
