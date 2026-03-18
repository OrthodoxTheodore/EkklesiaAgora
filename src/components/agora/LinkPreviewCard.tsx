'use client';

import React from 'react';
import type { LinkPreview } from '@/lib/types/social';

interface LinkPreviewCardProps {
  preview: LinkPreview;
}

export default function LinkPreviewCard({ preview }: LinkPreviewCardProps) {
  let hostname = preview.url;
  try {
    hostname = new URL(preview.url).hostname;
  } catch {
    // use raw URL as fallback
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-navy-light border border-gold/[0.10] rounded-md overflow-hidden mt-3 hover:border-gold/30 transition-colors"
    >
      {preview.imageUrl && (
        <img
          src={preview.imageUrl}
          alt={preview.title ?? 'Link preview'}
          className="w-full h-[120px] object-cover"
        />
      )}
      <div>
        {preview.title && (
          <p className="font-cinzel text-xs text-text-light px-3 pt-2 truncate">
            {preview.title}
          </p>
        )}
        {preview.description && (
          <p className="font-garamond text-base text-text-mid px-3 line-clamp-2">
            {preview.description}
          </p>
        )}
        <p className="font-cinzel text-xs text-text-mid px-3 pb-2 pt-1">{hostname}</p>
      </div>
    </a>
  );
}
