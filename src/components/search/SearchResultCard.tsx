import React from 'react';
import Link from 'next/link';

interface SearchResultCardProps {
  type: 'VIDEO' | 'POST' | 'PERSON' | 'SCRIPTURE' | 'FATHERS';
  title: string;
  context: string;
  href: string;
}

export function SearchResultCard({ type, title, context, href }: SearchResultCardProps) {
  return (
    <Link
      href={href}
      className="block bg-navy-mid border border-gold/[0.15] rounded px-4 py-3 hover:bg-navy-light transition-colors"
    >
      <span className="font-cinzel text-xs font-bold text-gold uppercase tracking-widest">{type}</span>
      <p className="text-text-light text-sm font-garamond mt-1">{title}</p>
      <p className="text-text-mid text-xs font-garamond mt-0.5">{context}</p>
    </Link>
  );
}
