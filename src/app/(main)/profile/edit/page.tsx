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

  // Build a plain serializable object — Firestore Timestamps cannot cross the
  // server→client component boundary in Next.js, so we omit them entirely.
  const profileProps = {
    uid: profile.uid,
    handle: profile.handle,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    bannerUrl: profile.bannerUrl,
    jurisdictionId: profile.jurisdictionId,
    patronSaint: profile.patronSaint,
    followerCount: profile.followerCount,
    followingCount: profile.followingCount,
    postCount: profile.postCount,
    calendarPreference: profile.calendarPreference,
    locationSharingEnabled: profile.locationSharingEnabled ?? false,
    city: profile.city,
    stateRegion: profile.stateRegion,
    displayNameKeywords: profile.displayNameKeywords,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-cinzel text-2xl font-bold text-gold mb-2">Edit Profile</h1>
      <p className="font-garamond text-text-mid text-base mb-8">
        Update your display name, avatar, bio, and other profile details.
      </p>
      <ProfileEditForm profile={profileProps} uid={uid} />
    </div>
  );
}
