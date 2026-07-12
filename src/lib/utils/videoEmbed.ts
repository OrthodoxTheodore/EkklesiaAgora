export type VideoEmbedPlatform = 'youtube' | 'rumble' | 'vimeo';

export interface VideoEmbedInfo {
  platform: VideoEmbedPlatform;
  embedUrl: string;
}

/**
 * Detects whether a shared URL points to a known video platform and, if so,
 * returns a playable iframe embed URL. Deliberately regex/host based (no
 * oEmbed network call) so it stays a pure function safe to call on both
 * server and client without extra latency or trusting third-party HTML.
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

  // Rumble: watch URLs look like rumble.com/v{id}-{slug}.html; the leading
  // "v{id}" segment doubles as the embed id (rumble.com/embed/{id}/).
  if (host === 'rumble.com') {
    if (parsed.pathname.startsWith('/embed/')) {
      return { platform: 'rumble', embedUrl: url };
    }
    const match = parsed.pathname.match(/^\/(v[a-z0-9]+)-/i);
    if (match) return { platform: 'rumble', embedUrl: `https://rumble.com/embed/${match[1]}/` };
    return null;
  }

  // Vimeo: vimeo.com/{id}
  if (host === 'vimeo.com') {
    const match = parsed.pathname.match(/^\/(\d+)/);
    if (match) return { platform: 'vimeo', embedUrl: `https://player.vimeo.com/video/${match[1]}` };
    return null;
  }

  return null;
}
