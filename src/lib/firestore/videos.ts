import { getAdminFirestore } from '@/lib/firebase/admin';
import type { Video, Channel } from '@/lib/types/video';

export function buildVideoSearchKeywords(title: string, description: string, tags: string[]): string[] {
  const combined = `${title} ${description} ${tags.join(' ')}`;
  const tokens = combined.toLowerCase().split(/[\s\W]+/).filter(t => t.length >= 3);
  return [...new Set(tokens)];
}

export async function getVideoById(videoId: string): Promise<Video | null> {
  const db = getAdminFirestore();
  const snap = await db.collection('videos').doc(videoId).get();
  return snap.exists ? (snap.data() as Video) : null;
}

export async function getChannelById(channelId: string): Promise<Channel | null> {
  const db = getAdminFirestore();
  const snap = await db.collection('channels').doc(channelId).get();
  return snap.exists ? (snap.data() as Channel) : null;
}

export async function isChannelHandleAvailable(handle: string): Promise<boolean> {
  const db = getAdminFirestore();
  const snap = await db.collection('channels').where('handle', '==', handle).limit(1).get();
  return snap.empty;
}
