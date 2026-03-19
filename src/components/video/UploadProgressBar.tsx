'use client';

interface UploadProgressBarProps {
  progress: number; // 0-100
  phase: 'uploading' | 'processing';
}

export default function UploadProgressBar({ progress, phase }: UploadProgressBarProps) {
  return (
    <div className="w-full">
      <p
        className={`font-cinzel text-xs text-text-mid mb-1 ${
          phase === 'processing' ? 'animate-pulse' : ''
        }`}
      >
        {phase === 'uploading' ? `Uploading... ${progress}%` : 'Processing...'}
      </p>
      <div className="w-full bg-navy-light rounded-full h-2">
        <div
          className="bg-gold h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
