'use client';

import React, { useState, useRef, useCallback } from 'react';
import { CANONICAL_ORTHODOX_JURISDICTIONS } from '@/lib/constants/jurisdictions';
import { getMembers, searchMembers } from '@/app/actions/synodeia';
import { MemberCard } from './MemberCard';
import { SynodiaSkeleton } from './SynodiaSkeleton';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { SynodeiaMember } from '@/lib/firestore/synodeia';

interface SynodeiaClientProps {
  initialMembers: SynodeiaMember[];
}

export function SynodeiaClient({ initialMembers }: SynodeiaClientProps) {
  const [activeJurisdiction, setActiveJurisdiction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<SynodeiaMember[]>(initialMembers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleJurisdictionChange = useCallback(async (jurisdictionId: string | null) => {
    setActiveJurisdiction(jurisdictionId);
    setSearchQuery('');
    setLoading(true);
    setError(null);
    try {
      const result = await getMembers(jurisdictionId);
      setMembers(result);
    } catch {
      setError('Unable to load members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setError(null);
      if (query.length === 0) {
        setLoading(true);
        try {
          const result = await getMembers(null);
          setActiveJurisdiction(null);
          setMembers(result);
        } catch {
          setError('Unable to load members. Please try again.');
        } finally {
          setLoading(false);
        }
      } else if (query.length >= 2) {
        setActiveJurisdiction(null);
        setLoading(true);
        try {
          const result = await searchMembers(query, null);
          setMembers(result);
        } catch {
          setError('Unable to load members. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    }, 300);
  }, []);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMembers(activeJurisdiction);
      setMembers(result);
    } catch {
      setError('Unable to load members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeJurisdiction]);

  const tabs = [
    { id: null, label: 'All Jurisdictions' },
    ...CANONICAL_ORTHODOX_JURISDICTIONS.map(j => ({ id: j.id as string | null, label: j.label })),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Jurisdiction filter tabs */}
      <div
        role="tablist"
        aria-label="Filter by jurisdiction"
        className="flex overflow-x-auto gap-1 border-b border-gold/[0.10]"
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = activeJurisdiction === tab.id && searchQuery === '';
          return (
            <button
              key={tab.id ?? 'all'}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleJurisdictionChange(tab.id)}
              className={`font-cinzel text-xs uppercase tracking-widest px-3 py-2 whitespace-nowrap cursor-pointer transition-colors border-b-2 focus-visible:ring-2 focus-visible:ring-gold/60 focus:outline-none ${
                isActive
                  ? 'text-gold border-gold'
                  : 'text-text-mid border-transparent hover:text-text-light'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Name search input */}
      <div>
        <Input
          id="synodeia-search"
          label="Search by name"
          type="text"
          placeholder="Search by name..."
          aria-label="Search by name..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Member grid */}
      {loading ? (
        <SynodiaSkeleton />
      ) : error ? (
        <Card className="text-center py-8">
          <p className="font-garamond text-text-mid text-base mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="font-cinzel text-xs uppercase tracking-widest text-gold border border-gold/40 rounded px-4 py-2 hover:bg-gold/10 transition-colors"
          >
            Retry
          </button>
        </Card>
      ) : members.length === 0 ? (
        <Card className="text-center py-8">
          {searchQuery.length >= 2 ? (
            <>
              <h2 className="font-cinzel text-text-light text-base mb-2">
                No results for &ldquo;{searchQuery}&rdquo;
              </h2>
              <p className="font-garamond text-text-mid text-sm">
                Try a different name or browse by jurisdiction.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-cinzel text-text-light text-base mb-2">
                No members found
              </h2>
              <p className="font-garamond text-text-mid text-sm">
                No Orthodox members have joined from this jurisdiction yet.
              </p>
            </>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {members.map((member) => (
            <MemberCard key={member.uid} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
