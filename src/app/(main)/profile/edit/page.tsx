export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import { getProfileByUid } from '@/lib/firestore/profiles';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';

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
      privateKey: (
        (process.env.FIREBASE_PRIVATE_KEY ?? '').includes('-----BEGIN')
          ? process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
          : Buffer.from(process.env.FIREBASE_PRIVATE_KEY!, 'base64').toString('utf-8')
      ),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    },
  };
}

export default async function ProfileEditPage() {
  const tokens = await getTokens(await cookies(), getAuthConfig());

  if (!tokens) {
    redirect('/login');
  }

  const uid = tokens.decodedToken.uid;
  const profile = await getProfileByUid(uid);

  if (!profile) {
    redirect('/login');
  }

  // Strip non-serializable Firestore Timestamp fields before passing to client component
  const { createdAt: _c, updatedAt: _u, lastSeen: _l, ...serializableProfile } = profile;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-cinzel text-2xl font-bold text-gold mb-2">Edit Profile</h1>
      <p className="font-garamond text-text-mid text-base mb-8">
        Update your display name, avatar, bio, and other profile details.
      </p>
      <ProfileEditForm profile={serializableProfile} uid={uid} />
    </div>
  );
}
