'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      router.push('/search?q=' + encodeURIComponent(value.trim()));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim()) {
      debounceRef.current = setTimeout(() => {
        router.push('/search?q=' + encodeURIComponent(val.trim()));
      }, 300);
    }
  }

  return (
    <>
      {/* Desktop search input */}
      <div className="hidden md:block relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none"
        />
        <input
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="bg-navy-mid border border-gold/[0.15] rounded px-3 pl-8 py-1.5 text-sm font-garamond text-text-light placeholder:text-text-mid w-48 focus:w-64 transition-all focus-visible:ring-1 focus-visible:ring-gold/60 focus-visible:outline-none"
          aria-label="Search Ekklesia Agora"
        />
      </div>

      {/* Mobile search icon */}
      <button
        className="md:hidden w-11 h-11 flex items-center justify-center text-text-mid hover:text-gold transition-colors"
        onClick={() => router.push('/search')}
        aria-label="Search"
      >
        <Search size={20} />
      </button>
    </>
  );
}
