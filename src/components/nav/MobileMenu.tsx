'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div className="fixed top-[70px] left-0 right-0 z-50 bg-navy-mid border-b border-gold/20 shadow-lg">
        <nav className="flex flex-col p-4 gap-1" role="navigation" aria-label="Mobile navigation">
          <Link
            href="/"
            onClick={onClose}
            className="px-4 py-3 font-cinzel text-sm uppercase tracking-widest text-text-light hover:text-gold transition-colors"
          >
            Home
          </Link>
          <Link
            href="/agora"
            onClick={onClose}
            className="px-4 py-3 font-cinzel text-sm uppercase tracking-widest text-text-light hover:text-gold transition-colors"
          >
            Agora
          </Link>
          <Link
            href="/videos"
            onClick={onClose}
            className="px-4 py-3 font-cinzel text-sm uppercase tracking-widest text-text-light hover:text-gold transition-colors"
          >
            Videos
          </Link>
          <Link
            href="/scripture"
            onClick={onClose}
            className="px-4 py-3 font-cinzel text-sm uppercase tracking-widest text-text-light hover:text-gold transition-colors"
          >
            Scripture
          </Link>

          <div className="border-t border-gold/20 mt-2 pt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="px-4 py-2 font-cinzel text-sm uppercase tracking-widest text-text-light hover:text-gold transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="px-4 py-2 font-cinzel text-sm uppercase tracking-widest text-text-light hover:text-gold transition-colors"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block px-4 py-2 text-center font-cinzel text-sm uppercase tracking-widest text-gold border border-gold/40 rounded hover:bg-gold/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="block px-4 py-2 text-center font-cinzel text-sm uppercase tracking-widest text-navy bg-gold rounded hover:bg-gold-bright transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
