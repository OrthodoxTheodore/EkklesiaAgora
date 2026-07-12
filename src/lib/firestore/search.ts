'use server';
import 'server-only';
import { searchVideos } from './videos';
import { searchPosts } from './posts';
import { searchMembersByName } from './synodeia';
import type { Video } from '@/lib/types/video';
import type { Post } from '@/lib/types/social';
import type { SynodeiaMember } from './synodeia';

export interface GlobalSearchResults {
  videos: Video[];
  posts: Post[];
  people: SynodeiaMember[];
}

export async function globalSearch(query: string, limitPerType = 50): Promise<GlobalSearchResults> {
  const keyword = query.toLowerCase().trim();
  if (!keyword) return { videos: [], posts: [], people: [] };

  const [videos, posts, people] = await Promise.all([
    searchVideos(keyword, limitPerType),
    searchPosts(keyword, limitPerType),
    searchMembersByName(keyword, null, limitPerType),
  ]);

  return { videos, posts, people };
}
