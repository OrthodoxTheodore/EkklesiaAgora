'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createChannelApplication } from '@/app/actions/channels';
import { ORTHODOX_CATEGORIES } from '@/lib/constants/categories';

interface ChannelApplicationFormProps {
  uid: string;
}

type FormPhase = 'idle' | 'submitting' | 'success' | 'error';

export default function ChannelApplicationForm({ uid }: ChannelApplicationFormProps) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [channelType, setChannelType] = useState<'personal' | 'institutional'>('personal');
  const [description, setDescription] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState<string>(ORTHODOX_CATEGORIES[0]);
  const [phase, setPhase] = useState<FormPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setPhase('submitting');

    const result = await createChannelApplication(uid, {
      name: name.trim(),
      handle: handle.trim(),
      channelType,
      description: description.trim(),
      primaryCategory,
    });

    if (!result.success) {
      setPhase('error');
      setErrorMessage(result.error);
      return;
    }

    setPhase('success');
  }

  if (phase === 'success') {
    return (
      <div className="p-6 bg-navy-mid border border-gold/[0.15] rounded-[6px]">
        <p className="font-cinzel text-sm text-gold">Application Submitted</p>
        <p className="font-garamond text-base text-text-light mt-2">
          Your channel application has been submitted for review. You will be notified when a
          moderator approves or responds to your application.
        </p>
      </div>
    );
  }

  const isSubmitting = phase === 'submitting';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Channel name */}
      <Input
        id="channel-name"
        label="Channel Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={100}
        disabled={isSubmitting}
        placeholder="e.g. Orthodox Daily"
      />

      {/* Channel handle */}
      <div className="flex flex-col gap-1">
        <Input
          id="channel-handle"
          label="Channel Handle *"
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase())}
          required
          minLength={3}
          maxLength={50}
          disabled={isSubmitting}
          placeholder="lowercase-letters-and-hyphens"
          pattern="^[a-z0-9][a-z0-9-]*[a-z0-9]$"
        />
        <p className="font-garamond text-xs text-text-mid">
          lowercase letters, numbers, and hyphens only — no leading or trailing hyphens
        </p>
      </div>

      {/* Channel type */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="channel-type"
          className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
        >
          Channel Type <span className="text-crimson">*</span>
        </label>
        <select
          id="channel-type"
          value={channelType}
          onChange={(e) => setChannelType(e.target.value as 'personal' | 'institutional')}
          disabled={isSubmitting}
          className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-2 text-text-light font-garamond focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim transition-colors duration-150 disabled:opacity-50"
        >
          <option value="personal">Personal</option>
          <option value="institutional">Institutional</option>
        </select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="channel-description"
          className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
        >
          Description
        </label>
        <textarea
          id="channel-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
          disabled={isSubmitting}
          placeholder="Describe your channel's mission and content..."
          className="font-garamond text-base bg-navy-mid border border-gold/[0.15] rounded-[6px] p-3 text-text-light focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim transition-colors duration-150 disabled:opacity-50 resize-y"
        />
      </div>

      {/* Primary category */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="channel-category"
          className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
        >
          Primary Orthodox Category <span className="text-crimson">*</span>
        </label>
        <select
          id="channel-category"
          value={primaryCategory}
          onChange={(e) => setPrimaryCategory(e.target.value)}
          disabled={isSubmitting}
          className="bg-navy-mid border border-gold/[0.15] rounded-[6px] p-2 text-text-light font-garamond focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim transition-colors duration-150 disabled:opacity-50"
        >
          {ORTHODOX_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {errorMessage && (
        <p role="alert" className="font-garamond text-sm text-crimson">
          {errorMessage}
        </p>
      )}

      {/* Submit */}
      <Button type="submit" variant="gold" disabled={isSubmitting} loading={isSubmitting}>
        Submit Application
      </Button>
    </form>
  );
}
