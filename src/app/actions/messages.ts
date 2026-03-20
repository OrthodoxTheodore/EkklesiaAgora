'use server';

import { getAdminFirestore } from '@/lib/firebase/admin';
import { getConversationId } from '@/lib/firestore/messages';
import { FieldValue } from 'firebase-admin/firestore';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';

// Inline authConfig — same pattern as other action files
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

export async function createOrGetConversation(otherUid: string): Promise<string> {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) throw new Error('Unauthorized');

  const currentUid = tokens.decodedToken.uid;
  if (otherUid === currentUid) throw new Error('Cannot message yourself');

  const conversationId = getConversationId(currentUid, otherUid);
  const db = getAdminFirestore();
  const convRef = db.collection('conversations').doc(conversationId);
  const convSnap = await convRef.get();

  if (!convSnap.exists) {
    // Fetch both user profiles for denormalized participant data
    const [currentProfileSnap, otherProfileSnap] = await Promise.all([
      db.collection('userProfiles').doc(currentUid).get(),
      db.collection('userProfiles').doc(otherUid).get(),
    ]);

    const currentProfile = currentProfileSnap.data() ?? {};
    const otherProfile = otherProfileSnap.data() ?? {};

    await convRef.set({
      conversationId,
      participantUids: [currentUid, otherUid],
      participantProfiles: {
        [currentUid]: {
          displayName: currentProfile.displayName ?? '',
          avatarUrl: currentProfile.avatarUrl ?? null,
          handle: currentProfile.handle ?? '',
        },
        [otherUid]: {
          displayName: otherProfile.displayName ?? '',
          avatarUrl: otherProfile.avatarUrl ?? null,
          handle: otherProfile.handle ?? '',
        },
      },
      lastMessage: '',
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessageSenderUid: '',
      unreadCounts: { [currentUid]: 0, [otherUid]: 0 },
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  return conversationId;
}

export async function sendMessage(conversationId: string, text: string): Promise<void> {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) throw new Error('Unauthorized');

  const currentUid = tokens.decodedToken.uid;
  const trimmedText = text.trim();

  if (!trimmedText) throw new Error('Message text cannot be empty');
  if (trimmedText.length > 2000) throw new Error('Message text exceeds 2000 characters');

  const db = getAdminFirestore();

  // Fetch current user's profile for denormalized sender fields
  const profileSnap = await db.collection('userProfiles').doc(currentUid).get();
  const profile = profileSnap.data() ?? {};

  // Fetch conversation to find the other participant
  const convSnap = await db.collection('conversations').doc(conversationId).get();
  if (!convSnap.exists) throw new Error('Conversation not found');

  const convData = convSnap.data()!;
  const participantUids: string[] = convData.participantUids ?? [];
  const otherUid = participantUids.find((uid) => uid !== currentUid) ?? '';

  // Write message document
  const msgRef = db.collection('conversations').doc(conversationId).collection('messages').doc();
  await msgRef.set({
    senderUid: currentUid,
    senderDisplayName: profile.displayName ?? '',
    senderAvatarUrl: profile.avatarUrl ?? null,
    text: trimmedText,
    createdAt: FieldValue.serverTimestamp(),
    seenAt: null,
    seenBy: [],
  });

  // Update conversation metadata
  await db.collection('conversations').doc(conversationId).update({
    lastMessage: trimmedText.slice(0, 80),
    lastMessageAt: FieldValue.serverTimestamp(),
    lastMessageSenderUid: currentUid,
    [`unreadCounts.${otherUid}`]: FieldValue.increment(1),
  });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return;

  const currentUid = tokens.decodedToken.uid;
  const db = getAdminFirestore();

  // Reset unread count for current user
  await db.collection('conversations').doc(conversationId).update({
    [`unreadCounts.${currentUid}`]: 0,
  });

  // Mark unread messages from other participants as seen
  const unreadMsgsSnap = await db
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .where('senderUid', '!=', currentUid)
    .where('seenAt', '==', null)
    .get();

  if (unreadMsgsSnap.empty) return;

  const batch = db.batch();
  const now = FieldValue.serverTimestamp();
  for (const doc of unreadMsgsSnap.docs) {
    batch.update(doc.ref, {
      seenAt: now,
      seenBy: FieldValue.arrayUnion(currentUid),
    });
  }
  await batch.commit();
}

export async function updateLastSeen(): Promise<void> {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return; // Guest — silently skip

  const currentUid = tokens.decodedToken.uid;
  const db = getAdminFirestore();

  await db
    .collection('userProfiles')
    .doc(currentUid)
    .set({ lastSeen: FieldValue.serverTimestamp() }, { merge: true });
}
