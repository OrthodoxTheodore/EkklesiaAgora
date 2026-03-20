'use server';
import 'server-only';
import { searchVideos } from './videos';
import { searchPosts } from './posts';
import { searchMembersByName } from './synodeia';
import { searchVerses } from './scripture';
import { searchPatristicTexts } from './patristic';
import type { Video } from '@/lib/types/video';
import type { Post } from '@/lib/types/social';
import type { SynodeiaMember } from './synodeia';
import type { ScriptureVerse } from '@/lib/types/scripture';
import type { PatristicText } from '@/lib/types/patristic';

export interface GlobalSearchResults {
  videos: Video[];
  posts: Post[];
  people: SynodeiaMember[];
  scripture: ScriptureVerse[];
  fathers: PatristicText[];
}

export async function globalSearch(query: string, limitPerType = 50): Promise<GlobalSearchResults> {
  const keyword = query.toLowerCase().trim();
  if (!keyword) return { videos: [], posts: [], people: [], scripture: [], fathers: [] };

  const [videos, posts, people, scripture, fathers] = await Promise.all([
    searchVideos(keyword, limitPerType),
    searchPosts(keyword, limitPerType),
    searchMembersByName(keyword, null, limitPerType),
    searchVerses(keyword, undefined, limitPerType),
    searchPatristicTexts(keyword, limitPerType),
  ]);

  return { videos, posts, people, scripture, fathers };
}
