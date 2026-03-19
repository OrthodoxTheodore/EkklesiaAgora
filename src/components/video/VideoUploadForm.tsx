'use client';

import React, { useRef, useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import firebaseApp from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import UploadProgressBar from '@/components/video/UploadProgressBar';
import { createVideo } from '@/app/actions/videos';
import { ORTHODOX_CATEGORIES } from '@/lib/constants/categories';
import { useRouter } from 'next/navigation';

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB

interface VideoUploadFormProps {
  uid: string;
  channels: { channelId: string; name: string; handle: string }[];
}

type UploadPhase = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export default function VideoUploadForm({ uid, channels }: VideoUploadFormProps) {
  const router = useRouter();

  // Form field refs / state
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState<string>(ORTHODOX_CATEGORIES[0]);
  const [channelId, setChannelId] = useState('');

  // Upload state
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Duration detection: called when user picks a video file
  function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate 2 GB limit client-side
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('Video file exceeds the 2 GB limit. Please choose a smaller file.');
      e.target.value = '';
      return;
    }

    setErrorMessage(null);

    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.addEventListener('loadedmetadata', () => {
      setDurationSeconds(Math.round(video.duration));
      URL.revokeObjectURL(objectUrl);
    });
    video.src = objectUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const videoFile = videoFileRef.current?.files?.[0];
    const thumbFile = thumbFileRef.current?.files?.[0];

    if (!videoFile) {
      setErrorMessage('Please select a video file to upload.');
      return;
    }

    if (videoFile.size > MAX_FILE_SIZE) {
      setErrorMessage('Video file exceeds the 2 GB limit.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please enter a title.');
      return;
    }

    setPhase('uploading');
    setProgress(0);

    const storage = getStorage(firebaseApp);
    const videoId = crypto.randomUUID();
    let thumbnailUrl: string | null = null;

    try {
      // --- Upload thumbnail if provided ---
      if (thumbFile) {
        const thumbStoragePath = `thumbnails/${videoId}/${thumbFile.name}`;
        const thumbRef = ref(storage, thumbStoragePath);
        await new Promise<void>((resolve, reject) => {
          const thumbTask = uploadBytesResumable(thumbRef, thumbFile);
          thumbTask.on(
            'state_changed',
            () => {}, // no separate progress for thumbnail
            (err) => reject(err),
            async () => {
              thumbnailUrl = await getDownloadURL(thumbTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      // --- Upload video file ---
      const videoStoragePath = `videos/${uid}/${videoId}/${videoFile.name}`;
      const videoRef = ref(storage, videoStoragePath);
      const uploadTask = uploadBytesResumable(videoRef, videoFile);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(pct);
          },
          (err) => {
            console.error('Upload error:', err);
            reject(err);
          },
          () => resolve()
        );
      });

      // --- Fetch download URL ---
      setPhase('processing');
      const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);

      // --- Parse tags ---
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);

      // --- Call Server Action ---
      const result = await createVideo(uid, {
        videoId,
        videoUrl,
        storagePath: videoStoragePath,
        channelId: channelId || null,
        title: title.trim(),
        description: description.trim(),
        tags: parsedTags,
        category,
        thumbnailUrl,
        durationSeconds,
      });

      if (!result.success) {
        setPhase('error');
        setErrorMessage(result.error);
        return;
      }

      setPhase('done');

      // Redirect after 2 seconds
      setTimeout(() => {
        if (channelId) {
          const ch = channels.find((c) => c.channelId === channelId);
          router.push(ch ? `/channel/${ch.handle}` : '/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } catch {
      setPhase('error');
      setErrorMessage(
        'Upload failed. Check your connection and try again. Large files may need a stable connection.'
      );
    }
  }

  const isUploading = phase === 'uploading' || phase === 'processing';

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Video File */}
        <div className="flex flex-col gap-1">
          <label className="font-cinzel text-xs uppercase tracking-widest text-gold-dim">
            Video File <span className="text-crimson">*</span>
          </label>
          <input
            ref={videoFileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleVideoFileChange}
            disabled={isUploading}
            className="font-garamond text-text-light text-base file:font-cinzel file:text-xs file:uppercase file:bg-navy-light file:text-gold-dim file:border file:border-gold/[0.15] file:rounded file:px-3 file:py-1 file:mr-4 cursor-pointer disabled:opacity-50"
          />
          <p className="font-garamond text-xs text-text-mid">
            MP4, WebM, or QuickTime. Maximum 2 GB.
          </p>
        </div>

        {/* Thumbnail */}
        <div className="flex flex-col gap-1">
          <label className="font-cinzel text-xs uppercase tracking-widest text-gold-dim">
            Thumbnail (Optional)
          </label>
          <input
            ref={thumbFileRef}
            type="file"
            accept="image/*"
            disabled={isUploading}
            className="font-garamond text-text-light text-base file:font-cinzel file:text-xs file:uppercase file:bg-navy-light file:text-gold-dim file:border file:border-gold/[0.15] file:rounded file:px-3 file:py-1 file:mr-4 cursor-pointer disabled:opacity-50"
          />
        </div>

        {/* Title */}
        <Input
          id="video-title"
          label="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          disabled={isUploading}
          placeholder="Enter video title"
        />

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="video-description"
            className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
          >
            Description
          </label>
          <textarea
            id="video-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
            rows={4}
            disabled={isUploading}
            placeholder="Describe your video..."
            className="font-garamond text-base bg-navy-mid border border-gold/[0.15] rounded-[6px] p-3 text-text-light focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim transition-colors duration-150 disabled:opacity-50 resize-y"
          />
        </div>

        {/* Tags */}
        <Input
          id="video-tags"
          label="Tags (comma-separated, max 10)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isUploading}
          placeholder="liturgy, divine liturgy, orthodox"
        />

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="video-category"
            className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
          >
            Category <span className="text-crimson">*</span>
          </label>
          <select
            id="video-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isUploading}
            className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-2 text-text-light font-garamond focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim transition-colors duration-150 disabled:opacity-50"
          >
            {ORTHODOX_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Channel */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="video-channel"
            className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
          >
            Channel (Optional)
          </label>
          <select
            id="video-channel"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            disabled={isUploading}
            className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-2 text-text-light font-garamond focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim transition-colors duration-150 disabled:opacity-50"
          >
            <option value="">No channel (profile only)</option>
            {channels.map((ch) => (
              <option key={ch.channelId} value={ch.channelId}>
                {ch.name} (@{ch.handle})
              </option>
            ))}
          </select>
        </div>

        {/* Progress Bar */}
        {(phase === 'uploading' || phase === 'processing') && (
          <UploadProgressBar
            progress={progress}
            phase={phase === 'uploading' ? 'uploading' : 'processing'}
          />
        )}

        {/* Done Badge */}
        {phase === 'done' && (
          <div className="flex items-center gap-2 p-3 bg-navy-light border border-gold/[0.15] rounded-[6px]">
            <span className="font-cinzel text-xs uppercase tracking-widest text-gold bg-gold/10 border border-gold/[0.30] rounded-full px-3 py-1">
              Pending Review
            </span>
            <span className="font-garamond text-sm text-text-mid">
              Your video has been submitted and is awaiting moderation.
            </span>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <p role="alert" className="font-garamond text-sm text-crimson">
            {errorMessage}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="gold"
          disabled={isUploading || phase === 'done'}
          loading={isUploading}
        >
          Upload Video
        </Button>
      </form>
    </Card>
  );
}
