import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTokens } from 'next-firebase-auth-edge';
import { getProfileByHandle } from '@/lib/firestore/profiles';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { followUser, unfollowUser } from '@/app/actions/follows';

const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: 'AuthToken',
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT!,
    process.env.COOKIE_SECRET_PREVIOUS!,
  ],
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
};

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    redirect('/login');
  }

  const { handle } = await params;
  const profile = await getProfileByHandle(handle);

  if (!profile) {
    notFound();
  }

  const currentUserUid = tokens.decodedToken.uid;
  const isOwnProfile = currentUserUid === profile.uid;

  // Determine follow status by checking the follows collection
  let isFollowing = false;
  if (!isOwnProfile) {
    const db = getAdminFirestore();
    const followDoc = await db
      .collection('follows')
      .doc(`${currentUserUid}_${profile.uid}`)
      .get();
    isFollowing = followDoc.exists;
  }

  // Server Action closures — capture uid and profile.uid in server scope
  const uid = currentUserUid;
  const profileUid = profile.uid;

  async function handleFollow() {
    'use server';
    await followUser(uid, profileUid);
  }

  async function handleUnfollow() {
    'use server';
    await unfollowUser(uid, profileUid);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        currentUserUid={currentUserUid}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
      />
      {!isOwnProfile && (
        <div className="mt-3 flex gap-2">
          <Link
            href={`/messages?to=${profile.uid}`}
            className="px-4 py-2 bg-navy-mid border border-gold/[0.15] rounded font-cinzel text-xs uppercase tracking-widest text-text-light hover:text-gold hover:bg-navy-light transition-colors"
          >
            Send Message
          </Link>
        </div>
      )}
      <div className="mt-4">
        <ProfileTabs>
          <p className="font-garamond text-text-mid text-center py-12">
            Posts will appear here
          </p>
        </ProfileTabs>
      </div>
    </div>
  );
}
