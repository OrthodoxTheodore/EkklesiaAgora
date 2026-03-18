'use client';

import React from 'react';
import { ORTHODOX_CATEGORIES } from '@/lib/constants/categories';

interface CategoryFilterTabsProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilterTabs({
  activeCategory,
  onCategoryChange,
}: CategoryFilterTabsProps) {
  const tabs = ['All', ...ORTHODOX_CATEGORIES] as string[];

  return (
    <div
      role="tablist"
      aria-label="Filter posts by category"
      className="flex overflow-x-auto px-4 py-2 border-b border-gold/[0.10] gap-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {tabs.map((tab) => {
        const categoryValue = tab === 'All' ? null : tab;
        const isActive = activeCategory === categoryValue;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange(categoryValue)}
            className={`font-cinzel text-xs uppercase tracking-widest px-3 py-2 whitespace-nowrap cursor-pointer transition-colors border-b-2 focus-visible:ring-2 focus-visible:ring-gold/60 focus:outline-none ${
              isActive
                ? 'text-gold border-gold'
                : 'text-text-mid border-transparent hover:text-text-light'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
