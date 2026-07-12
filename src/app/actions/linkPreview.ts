'use server';

import ogs from 'open-graph-scraper';
import { resolveVideoEmbed } from '@/lib/utils/videoEmbed';
import type { LinkPreview } from '@/lib/types/social';

// Some sites (e.g. Rumble) silently stall requests that look bot-like
// instead of rejecting them, so a default/no User-Agent request times out.
// A realistic browser User-Agent gets a normal, fast response.
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  // Independent of the OG scrape — a video link should still embed even if
  // the site's OG tags fail to load (and vice versa).
  const [ogResult, embed] = await Promise.all([
    ogs({
      url,
      timeout: 8,
      fetchOptions: { headers: { 'user-agent': BROWSER_USER_AGENT } },
    }).catch(() => null),
    resolveVideoEmbed(url),
  ]);

  if (ogResult && !ogResult.error) {
    const { result } = ogResult;
    return {
      url,
      title: result.ogTitle ?? null,
      description: result.ogDescription ?? null,
      imageUrl: result.ogImage?.[0]?.url ?? null,
      siteName: result.ogSiteName ?? null,
      embedUrl: embed?.embedUrl ?? null,
    };
  }

  // OG scrape failed — still preserve the link if it's a recognized video,
  // so it renders as an embed instead of silently vanishing from the post.
  return embed ? { url, title: null, description: null, imageUrl: null, siteName: null, embedUrl: embed.embedUrl } : null;
}
