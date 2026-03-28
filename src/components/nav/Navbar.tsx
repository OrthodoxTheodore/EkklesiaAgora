'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { MobileMenu } from './MobileMenu';
import { NotificationBell } from './NotificationBell';
import { MessagesIcon } from './MessagesIcon';
import { SearchBar } from '@/components/search/SearchBar';
import { getAuth, signOut } from 'firebase/auth';
import firebaseApp from '@/lib/firebase/client';

export function Navbar() {
  const { user, loading, roleLevel, handle } = useAuth();
  const isAdmin = roleLevel >= 3; // admin (3) or super admin (4)
  const isModerator = roleLevel >= 2; // moderator (2), admin (3), or super admin (4)
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [fathersOpen, setFathersOpen] = useState(false);

  async function handleLogout() {
    try {
      // 1. Clear server-side session cookie
      await fetch('/api/logout', { method: 'POST' });
      // 2. Clear client-side auth state
      await signOut(getAuth(firebaseApp));
      setAvatarOpen(false);
      // 3. Redirect to home
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[70px] z-50 bg-gradient-to-b from-navy to-navy-mid border-b border-gold-dim/30">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">

          {/* Left: Logo + Site Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/Ekklesia_Agora.jpg"
              alt="Ekklesia Agora"
              width={40}
              height={40}
              className="rounded-full border border-gold/30 object-cover"
            />
            <span className="font-cinzel-dec text-gold text-lg tracking-wider hidden sm:block">
              Ekklesia Agora
            </span>
          </Link>

          {/* Center: Nav Links (desktop only) */}
          <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
            <Link
              href="/"
              className="font-cinzel text-xs uppercase tracking-widest text-text-light hover:text-gold transition-colors"
            >
              Home
            </Link>
            <Link
              href="/agora"
              className="font-cinzel text-xs uppercase tracking-widest text-text-light hover:text-gold transition-colors"
            >
              Agora
            </Link>
            <Link
              href="/videos"
              className="font-cinzel text-xs uppercase tracking-widest text-text-light hover:text-gold transition-colors"
            >
              Videos
            </Link>
            <Link
              href="/calendar"
              className="font-cinzel text-xs uppercase tracking-widest text-text-light hover:text-gold transition-colors"
            >
              Calendar
            </Link>
            <Link
              href="/synodeia"
              className="font-cinzel text-xs uppercase tracking-widest text-text-light hover:text-gold transition-colors"
            >
              Synodeia
            </Link>
            <Link
              href="/scripture"
              className="font-cinzel text-xs uppercase tracking-widest text-text-light hover:text-gold transition-colors"
            >
              Scripture
            </Link>
            <div className="relative" onMouseLeave={() => setFathersOpen(false)}>
              <button
                onMouseEnter={() => { setFathersOpen(true); setAvatarOpen(false); }}
                onClick={() => { setFathersOpen(!fathersOpen); setAvatarOpen(false); }}
                className="font-cinzel text-xs uppercase tracking-widest text-text-light hover:text-gold transition-colors"
                aria-expanded={fathersOpen}
                aria-haspopup="true"
              >
                Fathers
              </button>
              {fathersOpen && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-navy-mid border border-gold/20 rounded shadow-xl z-60">
                  <Link
                    href="/fathers"
                    onClick={() => setFathersOpen(false)}
                    className="block px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-text-light hover:text-gold hover:bg-gold/5 transition-colors"
                  >
                    Browse Fathers
                  </Link>
                  <Link
                    href="/fathers/guides"
                    onClick={() => setFathersOpen(false)}
                    className="block px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-text-light hover:text-gold hover:bg-gold/5 transition-colors"
                  >
                    Study Guides
                  </Link>
                </div>
              )}
            </div>
            {isModerator && (
              <Link
                href="/admin/moderation"
                className="font-cinzel text-xs uppercase tracking-widest text-gold-dim hover:text-gold transition-colors"
              >
                Moderation
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="font-cinzel text-xs uppercase tracking-widest text-gold-dim hover:text-gold transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right: Auth section (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {/* Search bar: desktop input + mobile icon */}
            <SearchBar />

            {/* Desktop auth controls */}
            <div className="hidden md:flex items-center gap-2">
              {loading ? (
                <div className="w-9 h-9 rounded-full bg-navy-light animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-1">
                  {/* Messages icon */}
                  <MessagesIcon uid={user.uid} />
                  {/* Notification bell */}
                  <NotificationBell uid={user.uid} />

                  {/* Avatar dropdown */}
                  <div className="relative">
                  <button
                    onClick={() => { setAvatarOpen(!avatarOpen); setFathersOpen(false); }}
                    className="w-9 h-9 rounded-full bg-gold-dim border border-gold/40 flex items-center justify-center font-cinzel text-navy text-sm font-bold hover:bg-gold transition-colors"
                    aria-label="User menu"
                    aria-expanded={avatarOpen}
                  >
                    {user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase() ?? 'U'}
                  </button>

                  {avatarOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-navy-mid border border-gold/20 rounded shadow-xl z-60">
                      <div className="px-4 py-2 border-b border-gold/10">
                        <p className="text-text-mid text-xs font-garamond truncate">{user.email}</p>
                      </div>
                      {handle && (
                        <Link
                          href={`/profile/${handle}`}
                          onClick={() => setAvatarOpen(false)}
                          className="block px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-text-light hover:text-gold hover:bg-gold/5 transition-colors"
                        >
                          Profile
                        </Link>
                      )}
                      <Link
                        href="/profile/edit"
                        onClick={() => setAvatarOpen(false)}
                        className="block px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-text-light hover:text-gold hover:bg-gold/5 transition-colors"
                      >
                        Edit Profile
                      </Link>
                      <Link
                        href="/agora"
                        onClick={() => setAvatarOpen(false)}
                        className="block px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-text-light hover:text-gold hover:bg-gold/5 transition-colors"
                      >
                        Agora
                      </Link>
                      {isModerator && (
                        <Link
                          href="/admin/moderation"
                          onClick={() => setAvatarOpen(false)}
                          className="block px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-gold-dim hover:text-gold hover:bg-gold/5 transition-colors"
                        >
                          Moderation
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setAvatarOpen(false)}
                          className="block px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-gold-dim hover:text-gold hover:bg-gold/5 transition-colors"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-crimson hover:bg-crimson/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-1.5 font-cinzel text-xs uppercase tracking-widest text-gold border border-gold/40 rounded hover:bg-gold/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 font-cinzel text-xs uppercase tracking-widest text-navy bg-gold rounded hover:bg-gold-bright transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger button (mobile only) */}
            <button
              className="md:hidden flex flex-col items-center justify-center w-9 h-9 gap-1.5"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className={`block w-6 h-0.5 bg-text-light transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-text-light transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-text-light transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
