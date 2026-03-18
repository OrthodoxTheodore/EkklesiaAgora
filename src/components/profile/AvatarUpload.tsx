'use client';

import React, { useRef, useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import firebaseApp from '@/lib/firebase/client';
import { updateAvatar } from '@/app/actions/profile';

interface AvatarUploadProps {
  uid: string;
  currentAvatarUrl: string | null;
  displayName: string;
  onUploadComplete?: (url: string) => void;
}

export function AvatarUpload({
  uid,
  currentAvatarUrl,
  displayName,
  onUploadComplete,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);

  const initial = displayName?.charAt(0).toUpperCase() ?? '?';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Max file size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    const storage = getStorage(firebaseApp);
    const timestamp = Date.now();
    const storageRef = ref(storage, `avatars/${uid}/${timestamp}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploadProgress(0);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        setUploadProgress(progress);
      },
      (err) => {
        console.error('Avatar upload error:', err);
        setError('Upload failed. Please try again.');
        setUploadProgress(null);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        await updateAvatar(uid, downloadUrl);
        setPreviewUrl(downloadUrl);
        setUploadProgress(null);
        onUploadComplete?.(downloadUrl);
      },
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar preview — click to open file picker */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative w-20 h-20 rounded-full border-2 border-gold/40 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-gold/60"
        aria-label="Upload avatar photo"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${displayName}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-navy-light flex items-center justify-center">
            <span className="font-cinzel text-gold text-2xl font-semibold">{initial}</span>
          </div>
        )}

        {/* Upload overlay hint */}
        <div className="absolute inset-0 bg-navy/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <span className="font-cinzel text-gold text-xs uppercase">Change</span>
        </div>
      </button>

      <p className="font-cinzel text-xs text-text-mid uppercase">Click to change avatar</p>

      {/* Upload progress bar */}
      {uploadProgress !== null && (
        <div className="w-full max-w-[200px] h-1.5 bg-navy-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-200"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="font-garamond italic text-xs text-crimson">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
