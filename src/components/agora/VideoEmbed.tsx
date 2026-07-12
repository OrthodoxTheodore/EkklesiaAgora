import React from 'react';

interface VideoEmbedProps {
  embedUrl: string;
  title?: string;
}

export function VideoEmbed({ embedUrl, title }: VideoEmbedProps) {
  return (
    <div className="relative w-full mt-3 rounded-md overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe
        src={embedUrl}
        title={title || 'Embedded video'}
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
