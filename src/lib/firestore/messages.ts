import 'server-only';
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { Conversation } from '@/lib/types/messages';

export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

export async function getConversationsForUser(uid: string): Promise<Conversation[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('conversations')
    .where('participantUids', 'array-contains', uid)
    .orderBy('lastMessageAt', 'desc')
    .limit(50)
    .get();
  return snap.docs.map((d) => d.data() as Conversation);
}

export async function getMessages(conversationId: string, limitCount = 100) {
  const db = getAdminFirestore();
  const snap = await db
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .limit(limitCount)
    .get();
  return snap.docs.map((d) => ({ messageId: d.id, ...d.data() }));
}
