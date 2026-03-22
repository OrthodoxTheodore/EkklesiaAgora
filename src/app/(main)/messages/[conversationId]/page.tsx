export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTokens } from 'next-firebase-auth-edge';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getMessages } from '@/lib/firestore/messages';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { ChevronLeft } from 'lucide-react';
import type { Message } from '@/lib/types/messages';

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

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const tokens = await getTokens(await cookies(), getAuthConfig());

  if (!tokens) {
    redirect('/login');
  }

  const uid = tokens.decodedToken.uid;
  const { conversationId } = await params;

  const db = getAdminFirestore();
  const convSnap = await db.collection('conversations').doc(conversationId).get();

  if (!convSnap.exists) {
    redirect('/messages');
  }

  const convData = convSnap.data()!;
  const participantUids: string[] = convData.participantUids ?? [];

  // Verify user is a participant
  if (!participantUids.includes(uid)) {
    redirect('/messages');
  }

  const messages = await getMessages(conversationId);

  // Get the other participant's profile
  const otherUid = participantUids.find((participantUid) => participantUid !== uid);
  const otherProfile = otherUid
    ? (convData.participantProfiles?.[otherUid] ?? null)
    : null;

  return (
    <div className="flex flex-col h-screen pt-[70px]">
      {/* Header */}
      <header className="h-14 bg-navy-mid border-b border-gold/[0.15] px-4 flex items-center gap-3 shrink-0">
        <Link
          href="/messages"
          className="text-text-mid hover:text-gold transition-colors"
          aria-label="Back to conversations"
        >
          <ChevronLeft size={20} />
        </Link>
        {otherProfile && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={otherProfile.avatarUrl || '/default-avatar.png'}
              alt={otherProfile.displayName}
              className="w-8 h-8 rounded-full border border-gold/[0.15] object-cover"
            />
            <span className="text-text-light font-cinzel text-sm font-bold">
              {otherProfile.displayName}
            </span>
          </>
        )}
      </header>

      {/* Message thread */}
      <MessageThread
        conversationId={conversationId}
        currentUid={uid}
        initialMessages={messages as unknown as Message[]}
      />

      {/* Composer */}
      <MessageComposer conversationId={conversationId} />
    </div>
  );
}
