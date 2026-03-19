'use client';

import React, { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CategoryFilterTabs from '@/components/agora/CategoryFilterTabs';

interface VideoBrowseClientProps {
  initialCategory: string | null;
  initialSearch: string;
}

export default function VideoBrowseClient({
  initialCategory,
  initialSearch,
}: VideoBrowseClientProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [, startTransition] = useTransition();

  const updateUrl = useCallback(
    (category: string | null, search: string) => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search.trim()) params.set('q', search.trim());
      const query = params.toString();
      startTransition(() => {
        router.push(`/videos${query ? `?${query}` : ''}`);
      });
    },
    [router]
  );

  function handleCategoryChange(category: string | null) {
    // Search and category are mutually exclusive — entering a category clears search
    setSearchValue('');
    updateUrl(category, '');
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchValue(value);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Search clears category filter
    updateUrl(null, searchValue);
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit}>
        <input
          type="search"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Search videos..."
          className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-2 text-text-light font-garamond w-full max-w-md focus:outline-none focus:border-gold/40 transition-colors"
          aria-label="Search videos"
        />
      </form>

      {/* Category filter tabs */}
      <CategoryFilterTabs
        activeCategory={searchValue.trim() ? null : initialCategory}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}
