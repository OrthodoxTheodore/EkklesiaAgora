'use server';

import ogs from 'open-graph-scraper';
import type { LinkPreview } from '@/lib/types/social';

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    const ogsResult = await ogs({ url, timeout: 5 });
    if (ogsResult.error) return null;
    const { result } = ogsResult;
    return {
      url,
      title: result.ogTitle ?? null,
      description: result.ogDescription ?? null,
      imageUrl: result.ogImage?.[0]?.url ?? null,
      siteName: result.ogSiteName ?? null,
    };
  } catch {
    return null;
  }
}
