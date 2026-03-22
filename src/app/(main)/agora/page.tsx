export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import FeedClient from '@/components/agora/FeedClient';

const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: 'AuthToken',
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT!,
    process.env.COOKIE_SECRET_PREVIOUS!,
  ],
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY!.includes('-----BEGIN') ? process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n') : Buffer.from(process.env.FIREBASE_PRIVATE_KEY!, 'base64').toString('utf-8')),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
};

/**
 * Agora feed page — protected Server Component.
 * Verifies auth server-side, then renders the client-side FeedClient.
 */
export default async function AgoraPage() {
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    redirect('/login');
  }

  const uid = tokens.decodedToken.uid;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <FeedClient uid={uid} />
    </div>
  );
}
