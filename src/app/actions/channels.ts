'use server';

import { randomUUID } from 'crypto';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { isChannelHandleAvailable, getChannelById } from '@/lib/firestore/videos';
import { ORTHODOX_CATEGORIES } from '@/lib/constants/categories';
import { z } from 'zod';

// Inline authConfig — same pattern as admin/actions.ts
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

const createChannelSchema = z.object({
  name: z.string().min(1).max(100),
  handle: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
      message: 'Handle must be lowercase alphanumeric with hyphens, no leading/trailing hyphens.',
    }),
  channelType: z.enum(['personal', 'institutional']),
  description: z.string().max(2000).default(''),
  primaryCategory: z.string().refine(
    (val) => (ORTHODOX_CATEGORIES as readonly string[]).includes(val),
    { message: 'Invalid category.' }
  ),
});

export async function createChannelApplication(
  uid: string,
  data: {
    name: string;
    handle: string;
    channelType: 'personal' | 'institutional';
    description: string;
    primaryCategory: string;
  }
): Promise<{ success: true; channelId: string } | { success: false; error: string }> {
  const parsed = createChannelSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const validated = parsed.data;

  try {
    const db = getAdminFirestore();

    // Check handle uniqueness
    const handleAvailable = await isChannelHandleAvailable(validated.handle);
    if (!handleAvailable) {
      return { success: false, error: 'Channel handle is already taken.' };
    }

    const channelId = randomUUID();

    await db.collection('channels').doc(channelId).set({
      channelId,
      ownerUid: uid,
      handle: validated.handle,
      name: validated.name,
      channelType: validated.channelType,
      description: validated.description,
      primaryCategory: validated.primaryCategory,
      logoUrl: null,
      bannerUrl: null,
      subscriberCount: 0,
      videoCount: 0,
      status: 'pending_approval',
      createdAt: FieldValue.serverTimestamp(),
      approvedAt: null,
      approvedBy: null,
    });

    return { success: true, channelId };
  } catch (err) {
    console.error('createChannelApplication error:', err);
    return { success: false, error: 'Failed to create channel application.' };
  }
}

export async function approveChannel(
  channelId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const tokens = await getTokens(await cookies(), authConfig);
    if (!tokens) {
      return { error: 'Not authenticated.' };
    }

    const { decodedToken } = tokens;
    const callerUid: string = decodedToken.uid;
    const callerRoleLevel: number =
      (decodedToken as { roleLevel?: number }).roleLevel ?? 0;

    if (callerRoleLevel < 2) {
      return { error: 'Insufficient permissions.' };
    }

    const db = getAdminFirestore();

    // Fetch channel to get owner UID
    const channel = await getChannelById(channelId);
    if (!channel) {
      return { error: 'Channel not found.' };
    }

    // Update channel to approved
    await db.collection('channels').doc(channelId).update({
      status: 'approved',
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: callerUid,
    });

    // Write approval notification to channel owner
    const notifRef = db
      .collection('users')
      .doc(channel.ownerUid)
      .collection('notifications')
      .doc();

    await notifRef.set({
      notificationId: notifRef.id,
      type: 'moderation',
      fromUid: callerUid,
      fromHandle: '',
      fromDisplayName: 'Moderator',
      fromAvatarUrl: null,
      postId: null,
      postText: null,
      videoId: null,
      decision: 'published',
      moderatorNote: 'Your channel application has been approved.',
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error('approveChannel error:', err);
    return { error: 'Failed to approve channel.' };
  }
}

export async function rejectChannel(
  channelId: string,
  reason: string
): Promise<{ success: true } | { error: string }> {
  try {
    const tokens = await getTokens(await cookies(), authConfig);
    if (!tokens) {
      return { error: 'Not authenticated.' };
    }

    const { decodedToken } = tokens;
    const callerUid: string = decodedToken.uid;
    const callerRoleLevel: number =
      (decodedToken as { roleLevel?: number }).roleLevel ?? 0;

    if (callerRoleLevel < 2) {
      return { error: 'Insufficient permissions.' };
    }

    const db = getAdminFirestore();

    // Fetch channel to get owner UID
    const channel = await getChannelById(channelId);
    if (!channel) {
      return { error: 'Channel not found.' };
    }

    // Update channel to rejected
    await db.collection('channels').doc(channelId).update({
      status: 'rejected',
    });

    // Write rejection notification to channel owner
    const notifRef = db
      .collection('users')
      .doc(channel.ownerUid)
      .collection('notifications')
      .doc();

    await notifRef.set({
      notificationId: notifRef.id,
      type: 'moderation',
      fromUid: callerUid,
      fromHandle: '',
      fromDisplayName: 'Moderator',
      fromAvatarUrl: null,
      postId: null,
      postText: null,
      videoId: null,
      decision: 'rejected',
      moderatorNote: reason,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error('rejectChannel error:', err);
    return { error: 'Failed to reject channel.' };
  }
}

export async function subscribeChannel(
  uid: string,
  channelId: string
): Promise<{ subscribed: boolean } | { error: string }> {
  try {
    const db = getAdminFirestore();
    const subscriberRef = db
      .collection('channelSubscribes')
      .doc(channelId)
      .collection('subscribers')
      .doc(uid);

    const existing = await subscriberRef.get();
    if (existing.exists) {
      return { subscribed: true }; // Already subscribed
    }

    // Write subscriber doc
    await subscriberRef.set({ uid, createdAt: FieldValue.serverTimestamp() });

    // Increment subscriberCount atomically
    await db.collection('channels').doc(channelId).update({
      subscriberCount: FieldValue.increment(1),
    });

    return { subscribed: true };
  } catch (err) {
    console.error('subscribeChannel error:', err);
    return { error: 'Failed to subscribe to channel.' };
  }
}

export async function unsubscribeChannel(
  uid: string,
  channelId: string
): Promise<{ subscribed: boolean } | { error: string }> {
  try {
    const db = getAdminFirestore();
    const subscriberRef = db
      .collection('channelSubscribes')
      .doc(channelId)
      .collection('subscribers')
      .doc(uid);

    const existing = await subscriberRef.get();
    if (!existing.exists) {
      return { subscribed: false }; // Not subscribed
    }

    // Delete subscriber doc
    await subscriberRef.delete();

    // Decrement subscriberCount atomically
    await db.collection('channels').doc(channelId).update({
      subscriberCount: FieldValue.increment(-1),
    });

    return { subscribed: false };
  } catch (err) {
    console.error('unsubscribeChannel error:', err);
    return { error: 'Failed to unsubscribe from channel.' };
  }
}
