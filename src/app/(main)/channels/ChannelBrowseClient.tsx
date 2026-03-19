'use client';

import { useState } from 'react';
import CategoryFilterTabs from '@/components/agora/CategoryFilterTabs';
import ChannelCard from '@/components/video/ChannelCard';
import type { Channel } from '@/lib/types/video';

interface ChannelBrowseClientProps {
  allChannels: Channel[];
}

export default function ChannelBrowseClient({ allChannels }: ChannelBrowseClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredChannels =
    activeCategory === null
      ? allChannels
      : allChannels.filter((ch) => ch.primaryCategory === activeCategory);

  return (
    <>
      <CategoryFilterTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <div className="px-4 pt-6 pb-12">
        {filteredChannels.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="font-cinzel text-xl font-bold text-text-light mb-3">
              No Channels Yet
            </h2>
            <p className="font-garamond text-base text-text-mid">
              Approved channels will appear here. Apply to create your own channel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.map((channel) => (
              <ChannelCard key={channel.channelId} channel={channel} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
