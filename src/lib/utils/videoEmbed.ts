export type VideoEmbedPlatform = 'youtube' | 'rumble' | 'vimeo';

export interface VideoEmbedInfo {
  platform: VideoEmbedPlatform;
  embedUrl: string;
}

/**
 * Detects whether a shared URL points to YouTube or Vimeo and, if so,
 * returns a playable iframe embed URL. Deliberately regex/host based (no
 * network call) so it stays a pure function safe to call on both server
 * and client without extra latency.
 *
 * Rumble is deliberately NOT handled here: unlike YouTube/Vimeo, a Rumble
 * watch-page URL's slug does not reliably map to its embed id (confirmed by
 * testing — the ids differ), so guessing produces a broken "Video not
 * found" embed. Use resolveRumbleEmbedUrl (oEmbed API) for Rumble instead.
 */
export function getVideoEmbed(url: string): VideoEmbedInfo | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

  // YouTube: watch?v=, youtu.be/, /shorts/, /embed/
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    let id: string | null = null;
    if (parsed.pathname === '/watch') {
      id = parsed.searchParams.get('v');
    } else if (parsed.pathname.startsWith('/shorts/')) {
      id = parsed.pathname.split('/')[2] ?? null;
    } else if (parsed.pathname.startsWith('/embed/')) {
      id = parsed.pathname.split('/')[2] ?? null;
    }
    if (id) return { platform: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` };
    return null;
  }
  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1);
    if (id) return { platform: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` };
    return null;
  }

  // A rumble.com/embed/{id}/ URL is already a valid embed — pass through.
  if (host === 'rumble.com' && parsed.pathname.startsWith('/embed/')) {
    return { platform: 'rumble', embedUrl: url };
  }

  // Vimeo: vimeo.com/{id}
  if (host === 'vimeo.com') {
    const match = parsed.pathname.match(/^\/(\d+)/);
    if (match) return { platform: 'vimeo', embedUrl: `https://player.vimeo.com/video/${match[1]}` };
    return null;
  }

  return null;
}

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

/**
 * Resolves a Rumble watch-page URL to its real embed URL via Rumble's
 * public oEmbed API. Network call — server-side use only.
 */
async function resolveRumbleEmbedUrl(watchUrl: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://rumble.com/api/Media/oembed.json?url=${encodeURIComponent(watchUrl)}`,
      {
        headers: { 'user-agent': BROWSER_USER_AGENT },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { html?: string };
    const match = data.html?.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Full video-embed resolution, including the Rumble oEmbed lookup.
 * Network call — server-side use only (see fetchLinkPreview).
 */
export async function resolveVideoEmbed(url: string): Promise<VideoEmbedInfo | null> {
  const known = getVideoEmbed(url);
  if (known) return known;

  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }

  if (host === 'rumble.com') {
    const embedUrl = await resolveRumbleEmbedUrl(url);
    return embedUrl ? { platform: 'rumble', embedUrl } : null;
  }

  return null;
}
