import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Channel } from '@/lib/types/video';

interface ChannelCardProps {
  channel: Channel;
}

function ChannelInitials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="w-12 h-12 rounded-full border border-gold/[0.15] bg-navy-light flex items-center justify-center flex-shrink-0">
      <span className="font-cinzel text-sm text-gold">{initials}</span>
    </div>
  );
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const subscriberCount = channel.subscriberCount ?? 0;
  const subscriberLabel =
    subscriberCount === 1 ? '1 subscriber' : `${subscriberCount.toLocaleString()} subscribers`;

  return (
    <Link
      href={`/channel/${channel.handle}`}
      className="block bg-navy-mid border border-gold/[0.15] rounded-[6px] p-4 hover:border-gold/[0.30] transition-colors duration-150"
    >
      <div className="flex items-center gap-3">
        {/* Logo / Avatar */}
        {channel.logoUrl ? (
          <div className="relative w-12 h-12 rounded-full border border-gold/[0.15] overflow-hidden flex-shrink-0">
            <Image
              src={channel.logoUrl}
              alt={channel.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <ChannelInitials name={channel.name} />
        )}

        {/* Info */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-cinzel text-base text-text-light truncate">{channel.name}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category chip */}
            <span className="font-cinzel text-xs text-gold-dim bg-navy-light border border-gold/[0.15] rounded-full px-2 py-1">
              {channel.primaryCategory}
            </span>
            {/* Subscriber count */}
            <span className="font-cinzel text-xs text-text-mid">{subscriberLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
