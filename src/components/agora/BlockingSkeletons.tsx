'use client';

import React from 'react';

function PostCardSkeleton() {
  return (
    <div className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-8">
      {/* Header row */}
      <div className="flex items-center gap-3">
        {/* Avatar circle */}
        <div className="w-9 h-9 rounded-full bg-navy-light animate-pulse flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          {/* Display name bar */}
          <div className="h-3 bg-navy-light animate-pulse rounded w-32" />
          {/* Handle bar */}
          <div className="h-2 bg-navy-light animate-pulse rounded w-24" />
        </div>
      </div>

      {/* Post text bars */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-3 bg-navy-light animate-pulse rounded w-full" />
        <div className="h-3 bg-navy-light animate-pulse rounded w-5/6" />
        <div className="h-3 bg-navy-light animate-pulse rounded w-4/6" />
      </div>

      {/* Bottom row: category chip + buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="h-5 bg-navy-light animate-pulse rounded-full w-24" />
        <div className="flex gap-4">
          <div className="h-5 bg-navy-light animate-pulse rounded w-10" />
          <div className="h-5 bg-navy-light animate-pulse rounded w-10" />
        </div>
      </div>
    </div>
  );
}

export default function BlockingSkeletons() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading posts"
      className="flex flex-col gap-4"
    >
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}
