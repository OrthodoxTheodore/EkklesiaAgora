export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import { getAdminFirestore } from '@/lib/firebase/admin';
import VideoUploadForm from '@/components/video/VideoUploadForm';

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

export default async function UploadPage() {
  const tokens = await getTokens(await cookies(), getAuthConfig());

  if (!tokens) {
    redirect('/login');
  }

  const { decodedToken } = tokens;
  const uid: string = decodedToken.uid;
  const roleLevel: number =
    (decodedToken as { roleLevel?: number }).roleLevel ?? 0;

  // Require roleLevel >= 1 (registered user)
  if (roleLevel < 1) {
    redirect('/login');
  }

  // Fetch user's approved channels
  const db = getAdminFirestore();
  const channelsSnap = await db
    .collection('channels')
    .where('ownerUid', '==', uid)
    .where('status', '==', 'approved')
    .get();

  const userChannels = channelsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      channelId: data.channelId as string,
      name: data.name as string,
      handle: data.handle as string,
    };
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-cinzel text-2xl font-bold text-gold mb-2">Upload Video</h1>
      <p className="font-garamond text-text-mid text-base mb-8">
        Share Orthodox Christian content with the community. All uploads are reviewed before
        publishing.
      </p>
      <VideoUploadForm uid={uid} channels={userChannels} />
    </div>
  );
}
