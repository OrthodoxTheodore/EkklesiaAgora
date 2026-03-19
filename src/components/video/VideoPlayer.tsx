'use client';

import React, { useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  className?: string;
}

export default function VideoPlayer({ videoUrl, thumbnailUrl, className = '' }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`w-full ${className}`}>
      <video
        className="w-full aspect-video rounded-[6px]"
        controls
        src={videoUrl}
        poster={thumbnailUrl ?? undefined}
        preload="metadata"
        aria-label="Video player"
        onError={() => setHasError(true)}
      />
      {hasError && (
        <p className="font-garamond text-base text-crimson mt-2">
          Video unavailable. Try refreshing the page.
        </p>
      )}
    </div>
  );
}
