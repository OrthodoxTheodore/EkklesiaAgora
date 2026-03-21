import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import Image from 'next/image';
import { getAdminFirestore } from '@/lib/firebase/admin';
// SubscribeButton wraps subscribeChannel / unsubscribeChannel Server Actions
import SubscribeButton from './SubscribeButton';
import type { Channel, Video } from '@/lib/types/video';
import VideoCard from '@/components/video/VideoCard';

const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: 'AuthToken',
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT!,
    process.env.COOKIE_SECRET_PREVIOUS!,
  ],
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: Buffer.from(process.env.FIREBASE_PRIVATE_KEY!, 'base64').toString('utf-8'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
};

interface ChannelPageProps {
  params: Promise<{ handle: string }>;
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { handle } = await params;
  const db = getAdminFirestore();

  // Fetch channel by handle
  const channelsSnap = await db
    .collection('channels')
    .where('handle', '==', handle)
    .limit(1)
    .get();

  if (channelsSnap.empty) {
    notFound();
  }

  const channelDoc = channelsSnap.docs[0];
  const channel = channelDoc.data() as Channel;

  // Get current user (optional — for subscribe state and owner check)
  const tokens = await getTokens(await cookies(), authConfig);
  const uid = tokens?.decodedToken.uid ?? null;
  const roleLevel: number =
    tokens
      ? ((tokens.decodedToken as { roleLevel?: number }).roleLevel ?? 0)
      : 0;

  // Only show approved channels; owner and moderator+ can preview
  const isOwner = uid !== null && channel.ownerUid === uid;
  const isModerator = roleLevel >= 2;
  if (channel.status !== 'approved' && !isOwner && !isModerator) {
    notFound();
  }

  // Check if current user is subscribed
  let initialSubscribed = false;
  if (uid) {
    const subscriberDoc = await db
      .collection('channelSubscribes')
      .doc(channel.channelId)
      .collection('subscribers')
      .doc(uid)
      .get();
    initialSubscribed = subscriberDoc.exists;
  }

  // Fetch published videos for this channel
  const videosSnap = await db
    .collection('videos')
    .where('channelId', '==', channel.channelId)
    .where('status', '==', 'published')
    .orderBy('createdAt', 'desc')
    .get();

  const videos = videosSnap.docs.map((d) => d.data() as Video);

  const subscriberCount = channel.subscriberCount ?? 0;
  const subscriberLabel =
    subscriberCount === 1
      ? '1 subscriber'
      : `${subscriberCount.toLocaleString()} subscribers`;

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative w-full h-[200px] bg-navy-light overflow-hidden">
        {channel.bannerUrl && (
          <Image
            src={channel.bannerUrl}
            alt={`${channel.name} banner`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
      </div>

      {/* Channel header */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-end gap-4 -mt-10 mb-4">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-full border-4 border-navy bg-navy-light overflow-hidden flex-shrink-0">
            {channel.logoUrl ? (
              <Image
                src={channel.logoUrl}
                alt={channel.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-cinzel text-xl text-gold">
                  {channel.name[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="pb-1">
            <h1 className="font-cinzel text-2xl font-bold text-text-light leading-tight">
              {channel.name}
            </h1>
            <p className="font-cinzel text-xs text-text-mid mt-1">{subscriberLabel}</p>
          </div>
        </div>

        {/* Description + subscribe */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          {channel.description ? (
            <p className="font-garamond text-base text-text-light max-w-2xl leading-relaxed">
              {channel.description}
            </p>
          ) : (
            <div />
          )}

          {uid && (
            <div className="flex-shrink-0">
              <SubscribeButton
                uid={uid}
                channelId={channel.channelId}
                initialSubscribed={initialSubscribed}
              />
            </div>
          )}
        </div>

        {/* Video grid */}
        {videos.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="font-cinzel text-xl font-bold text-text-light mb-3">No Videos Yet</h2>
            <p className="font-garamond text-base text-text-mid">
              This channel hasn&apos;t published any videos. Subscribe to be notified when they do.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {videos.map((video) => (
              <VideoCard key={video.videoId} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
