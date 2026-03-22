export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import { getProfileByUid } from '@/lib/firestore/profiles';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { Card } from '@/components/ui/Card';

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

export default async function ProfileEditPage() {
  try {
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    redirect('/login');
  }

  const uid = tokens.decodedToken.uid;
  let profile = await getProfileByUid(uid);

  // Edge case: existing users who don't have a userProfiles doc yet
  if (!profile) {
    const email = tokens.decodedToken.email ?? `${uid}@unknown`;
    const defaultHandle = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .slice(0, 30);

    const db = getAdminFirestore();
    const existing = await db
      .collection('userProfiles')
      .where('handle', '==', defaultHandle)
      .limit(1)
      .get();
    const handle = existing.empty ? defaultHandle : `${defaultHandle}_${uid.slice(0, 6)}`;

    await db.collection('userProfiles').doc(uid).set({
      uid,
      handle,
      displayName: email.split('@')[0],
      bio: '',
      avatarUrl: null,
      bannerUrl: null,
      jurisdictionId: null,
      patronSaint: null,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Reload after creation
    profile = await getProfileByUid(uid);
  }

  if (!profile) {
    // Should never reach here after creation above
    redirect('/dashboard');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-6">
        Edit Profile
      </h1>
      <Card>
        <ProfileEditForm profile={profile} uid={uid} />
      </Card>
    </div>
  );
  } catch (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        <h1>Profile Page Error</h1>
        <pre>{String(error)}</pre>
      </div>
    );
  }
}
