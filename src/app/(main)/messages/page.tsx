import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import { getConversationsForUser } from '@/lib/firestore/messages';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { MessagesPageClient } from './MessagesPageClient';

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

interface MessagesPageProps {
  searchParams: Promise<{ to?: string; active?: string }>;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    redirect('/login');
  }

  const uid = tokens.decodedToken.uid;
  const { to, active } = await searchParams;

  // If ?to= param is present, create or get conversation and redirect with active param
  if (to && to !== uid) {
    // Import here to avoid circular dependency — createOrGetConversation is a Server Action
    const { createOrGetConversation } = await import('@/app/actions/messages');
    try {
      const conversationId = await createOrGetConversation(to);
      redirect(`/messages?active=${conversationId}`);
    } catch {
      redirect('/messages');
    }
  }

  const conversations = await getConversationsForUser(uid);

  // Build lastSeenMap: fetch lastSeen for all conversation partners
  const db = getAdminFirestore();
  const partnerUids = Array.from(
    new Set(
      conversations.flatMap((conv) =>
        conv.participantUids.filter((participantUid) => participantUid !== uid),
      ),
    ),
  );

  const lastSeenMap: Record<string, number | null> = {};
  if (partnerUids.length > 0) {
    // Batch fetch in chunks of 10 (Firestore in-array limit is 30, but keeping smaller for safety)
    const chunkSize = 10;
    for (let i = 0; i < partnerUids.length; i += chunkSize) {
      const chunk = partnerUids.slice(i, i + chunkSize);
      const snaps = await Promise.all(
        chunk.map((partnerUid) => db.collection('userProfiles').doc(partnerUid).get()),
      );
      for (const snap of snaps) {
        if (snap.exists) {
          const data = snap.data();
          const lastSeen = data?.lastSeen;
          lastSeenMap[snap.id] = lastSeen
            ? (lastSeen.toDate ? lastSeen.toDate().getTime() : null)
            : null;
        }
      }
    }
  }

  return (
    <MessagesPageClient
      conversations={conversations}
      currentUid={uid}
      lastSeenMap={lastSeenMap}
      activeConversationId={active}
    />
  );
}
