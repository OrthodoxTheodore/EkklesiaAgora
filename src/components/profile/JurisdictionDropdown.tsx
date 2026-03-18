'use client';

import React from 'react';
import {
  CANONICAL_ORTHODOX_JURISDICTIONS,
  OTHER_CHRISTIAN_JURISDICTIONS,
} from '@/lib/constants/jurisdictions';

interface JurisdictionDropdownProps {
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string;
}

export function JurisdictionDropdown({ value, onChange, error }: JurisdictionDropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="jurisdiction"
        className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
      >
        Jurisdiction
      </label>
      <select
        id="jurisdiction"
        aria-label="Select jurisdiction"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        className={`
          bg-navy-light/50 border border-gold-dim rounded-md px-4 py-3
          text-text-light font-garamond text-base
          focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim
          transition-colors duration-150
          ${error ? 'border-crimson focus:ring-crimson/40' : ''}
        `.trim()}
      >
        <option value="" className="bg-navy-mid text-text-mid font-garamond">
          Select your jurisdiction...
        </option>

        {/* Section 1: Canonical Eastern Orthodox Churches */}
        <optgroup
          label="Canonical Eastern Orthodox Churches"
          className="font-cinzel text-xs uppercase text-gold-dim"
        >
          {CANONICAL_ORTHODOX_JURISDICTIONS.map((j) => (
            <option
              key={j.id}
              value={j.id}
              className="bg-navy-mid font-garamond text-base text-text-light hover:bg-navy-light"
            >
              {j.label}
            </option>
          ))}
        </optgroup>

        {/* Section 2: Other Christians */}
        <optgroup
          label="Other Christians"
          className="font-cinzel text-xs uppercase text-gold-dim"
        >
          {OTHER_CHRISTIAN_JURISDICTIONS.map((j) => (
            <option
              key={j.id}
              value={j.id}
              className="bg-navy-mid font-garamond text-base text-text-light hover:bg-navy-light"
            >
              {j.label}
            </option>
          ))}
        </optgroup>
      </select>

      {error && (
        <p role="alert" className="font-garamond italic text-xs text-gold-dim mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
