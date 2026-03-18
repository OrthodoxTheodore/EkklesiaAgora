'use client';

import React, { useState } from 'react';

interface ProfileTabsProps {
  children?: React.ReactNode;
}

export function ProfileTabs({ children }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'media'>('posts');

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        className="flex border-b border-gold/[0.10] mb-4"
        aria-label="Profile content tabs"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'posts'}
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 font-cinzel text-xs uppercase tracking-widest transition-colors ${
            activeTab === 'posts'
              ? 'text-gold border-b-2 border-gold'
              : 'text-text-mid hover:text-text-light'
          }`}
        >
          Posts
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'media'}
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2 font-cinzel text-xs uppercase tracking-widest transition-colors ${
            activeTab === 'media'
              ? 'text-gold border-b-2 border-gold'
              : 'text-text-mid hover:text-text-light'
          }`}
        >
          Media
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'posts' && (
        <div role="tabpanel" aria-label="Posts tab content">
          {children ?? (
            <p className="font-garamond text-text-mid text-center py-12">
              No posts yet
            </p>
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <div role="tabpanel" aria-label="Media tab content">
          <p className="font-garamond text-text-mid text-center py-12">
            No photos yet
          </p>
        </div>
      )}
    </div>
  );
}
