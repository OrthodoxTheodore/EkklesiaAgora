'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { JurisdictionDropdown } from '@/components/profile/JurisdictionDropdown';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { updateProfile, updateBanner, updateLocationSharing } from '@/app/actions/profile';
import type { UserProfile } from '@/lib/types/social';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import firebaseApp from '@/lib/firebase/client';

const profileFormSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50, 'Max 50 characters'),
  handle: z
    .string()
    .min(3, 'Handle must be at least 3 characters')
    .max(30, 'Handle must be 30 characters or less')
    .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, and underscores only'),
  bio: z.string().max(300, 'Bio must be 300 characters or less'),
  jurisdictionId: z.string().nullable(),
  patronSaint: z.string().max(100, 'Max 100 characters').nullable(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  profile: UserProfile;
  uid: string;
}

export function ProfileEditForm({ profile, uid }: ProfileEditFormProps) {
  const [serverMessage, setServerMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [jurisdictionId, setJurisdictionId] = useState<string | null>(
    profile.jurisdictionId,
  );
  const [bannerProgress, setBannerProgress] = useState<number | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(
    profile.locationSharingEnabled ?? false
  );
  const [city, setCity] = useState<string>(profile.city ?? '');
  const [stateRegion, setStateRegion] = useState<string>(profile.stateRegion ?? '');
  const [locationSaving, setLocationSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile.displayName,
      handle: profile.handle,
      bio: profile.bio ?? '',
      jurisdictionId: profile.jurisdictionId,
      patronSaint: profile.patronSaint ?? '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setServerMessage(null);
    const result = await updateProfile(uid, {
      ...data,
      jurisdictionId,
      patronSaint: data.patronSaint || null,
    });
    if (result.success) {
      if (locationEnabled) {
        await updateLocationSharing(uid, { locationSharingEnabled: true, city, stateRegion });
      }
      setServerMessage({ type: 'success', text: 'Profile saved successfully.' });
    } else {
      setServerMessage({ type: 'error', text: result.error ?? 'Failed to save profile.' });
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerError(null);
    if (file.size > 5 * 1024 * 1024) {
      setBannerError('File size must be under 5MB.');
      return;
    }
    const storage = getStorage(firebaseApp);
    const timestamp = Date.now();
    const storageRef = ref(storage, `banners/${uid}/${timestamp}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setBannerProgress(0);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setBannerProgress(progress);
      },
      (err) => {
        console.error('Banner upload error:', err);
        setBannerError('Upload failed. Please try again.');
        setBannerProgress(null);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        await updateBanner(uid, downloadUrl);
        setBannerProgress(null);
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-4">
        <AvatarUpload
          uid={uid}
          currentAvatarUrl={profile.avatarUrl}
          displayName={profile.displayName}
        />
      </div>

      {/* Banner upload */}
      <div className="flex flex-col gap-1">
        <label className="font-cinzel text-xs uppercase tracking-widest text-gold-dim">
          Banner Image
        </label>
        <label
          htmlFor="banner-upload"
          className="flex items-center justify-center h-20 bg-navy-light/50 border border-dashed border-gold-dim rounded-md cursor-pointer hover:bg-navy-light transition-colors"
        >
          <span className="font-cinzel text-xs text-text-mid uppercase">
            {bannerProgress !== null
              ? `Uploading… ${bannerProgress}%`
              : 'Click to upload banner'}
          </span>
        </label>
        <input
          id="banner-upload"
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          className="hidden"
          aria-label="Upload banner image"
        />
        {bannerProgress !== null && (
          <div className="w-full h-1.5 bg-navy-light rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gold rounded-full transition-all duration-200"
              style={{ width: `${bannerProgress}%` }}
            />
          </div>
        )}
        {bannerError && (
          <p role="alert" className="font-garamond italic text-xs text-crimson">
            {bannerError}
          </p>
        )}
      </div>

      {/* Display name */}
      <Input
        id="displayName"
        label="Display Name"
        type="text"
        maxLength={50}
        error={errors.displayName?.message}
        {...register('displayName')}
      />

      {/* Handle */}
      <div className="flex flex-col gap-1">
        <Input
          id="handle"
          label="@Handle"
          type="text"
          maxLength={30}
          error={errors.handle?.message}
          {...register('handle')}
        />
        <p className="font-garamond text-xs text-text-mid">
          Your @handle is used in URLs and mentions. Lowercase letters, numbers, and
          underscores only.
        </p>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="bio"
          className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
        >
          Bio
        </label>
        <textarea
          id="bio"
          maxLength={300}
          placeholder="Tell the community about your journey in the Faith..."
          className="bg-navy-light/50 border border-gold-dim rounded-md px-4 py-3 text-text-light font-garamond text-base focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim transition-colors duration-150 resize-none min-h-[96px]"
          {...register('bio')}
        />
        {errors.bio && (
          <p role="alert" className="font-garamond italic text-xs text-gold-dim mt-0.5">
            {errors.bio.message}
          </p>
        )}
      </div>

      {/* Jurisdiction */}
      <JurisdictionDropdown
        value={jurisdictionId}
        onChange={setJurisdictionId}
      />

      {/* Patron saint */}
      <Input
        id="patronSaint"
        label="Patron Saint (optional)"
        type="text"
        maxLength={100}
        error={errors.patronSaint?.message}
        {...register('patronSaint')}
      />

      {/* Location sharing for Synodeia */}
      <div className="flex flex-col gap-3 border-t border-gold/[0.10] pt-6">
        <div className="flex items-center justify-between">
          <label
            htmlFor="location-toggle"
            className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
          >
            Share my location
          </label>
          <button
            id="location-toggle"
            type="button"
            role="switch"
            aria-checked={locationEnabled}
            onClick={async () => {
              const newVal = !locationEnabled;
              setLocationEnabled(newVal);
              setLocationSaving(true);
              await updateLocationSharing(uid, {
                locationSharingEnabled: newVal,
                city: newVal ? city : undefined,
                stateRegion: newVal ? stateRegion : undefined,
              });
              setLocationSaving(false);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              locationEnabled ? 'bg-gold' : 'bg-navy-light'
            } ${locationSaving ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                locationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="font-garamond text-xs text-text-mid">
          {locationEnabled
            ? 'Your city and state will be visible to other Synodeia members.'
            : 'Your location is private and will not appear in Synodeia.'}
        </p>
        {locationEnabled && (
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                id="city"
                label="City"
                type="text"
                maxLength={100}
                value={city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                id="stateRegion"
                label="State / Region"
                type="text"
                maxLength={100}
                value={stateRegion}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStateRegion(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Server message */}
      {serverMessage && (
        <p
          role="alert"
          className={`font-garamond text-sm ${
            serverMessage.type === 'success' ? 'text-gold' : 'text-crimson'
          } text-center`}
        >
          {serverMessage.text}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="gold"
        size="lg"
        loading={isSubmitting}
        className="w-full"
      >
        Save Profile
      </Button>
    </form>
  );
}
