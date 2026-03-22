export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { getAdminFirestore } from '@/lib/firebase/admin';
import ChannelBrowseClient from './ChannelBrowseClient';
import ChannelApplicationForm from '@/components/video/ChannelApplicationForm';
import type { Channel } from '@/lib/types/video';

function getAuthConfig() {
  return {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: 'AuthToken',
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT!,
    process.env.COOKIE_SECRET_PREVIOUS!,
  ],
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: ((process.env.FIREBASE_PRIVATE_KEY ?? '').includes('-----BEGIN') ? process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n') : Buffer.from(process.env.FIREBASE_PRIVATE_KEY!, 'base64').toString('utf-8')),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
};
}

export default async function ChannelsPage() {
  const db = getAdminFirestore();

  // Fetch all approved channels, ordered by subscriberCount desc
  const channelsSnap = await db
    .collection('channels')
    .where('status', '==', 'approved')
    .orderBy('subscriberCount', 'desc')
    .get();

  const channels = channelsSnap.docs.map((d) => d.data() as Channel);

  // Get current user for authenticated features
  const tokens = await getTokens(await cookies(), getAuthConfig());
  const uid = tokens?.decodedToken.uid ?? null;
  const roleLevel: number =
    tokens
      ? ((tokens.decodedToken as { roleLevel?: number }).roleLevel ?? 0)
      : 0;

  const isRegistered = roleLevel >= 1;

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-4 flex items-center justify-between">
        <h1 className="font-cinzel text-2xl font-bold text-gold">Channels</h1>
        {isRegistered && uid && (
          <Link
            href="#apply"
            className="font-cinzel text-xs uppercase tracking-widest text-gold-dim border border-gold/[0.15] rounded px-3 py-2 hover:border-gold/[0.40] transition-colors"
          >
            Apply for Channel
          </Link>
        )}
      </div>

      {/* Channel browse with category filter (client component) */}
      <ChannelBrowseClient allChannels={channels} />

      {/* Channel application section — visible to registered users */}
      {isRegistered && uid && (
        <section id="apply" className="max-w-2xl mx-auto px-4 pt-8 pb-16">
          <h2 className="font-cinzel text-xl font-bold text-text-light mb-2">
            Apply for a Channel
          </h2>
          <p className="font-garamond text-base text-text-mid mb-6">
            Submit an application to create your own Orthodox Christian channel. Applications are
            reviewed by moderators.
          </p>
          <ChannelApplicationForm uid={uid} />
        </section>
      )}
    </div>
  );
}
