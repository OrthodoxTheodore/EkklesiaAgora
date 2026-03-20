import { getAdminFirestore } from '@/lib/firebase/admin';
import type { Post } from '@/lib/types/social';

export function buildSearchKeywords(text: string): string[] {
  return [...new Set(
    text.toLowerCase()
      .split(/\s+|[^\w]/)
      .filter(w => w.length >= 3)
  )];
}

export async function getPost(postId: string): Promise<Post | null> {
  const db = getAdminFirestore();
  const doc = await db.collection('posts').doc(postId).get();
  return doc.exists ? (doc.data() as Post) : null;
}

export async function searchPosts(keyword: string, maxResults = 10): Promise<Post[]> {
  const db = getAdminFirestore();
  const term = keyword.toLowerCase().trim();
  if (!term) return [];
  const snap = await db.collection('posts')
    .where('searchKeywords', 'array-contains', term)
    .limit(maxResults)
    .get();
  return snap.docs.map(d => ({ postId: d.id, ...d.data() }) as Post);
}
