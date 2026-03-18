'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'firebase/ai';
import firebaseApp from '@/lib/firebase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createPost } from '@/app/actions/posts';
import { fetchLinkPreview } from '@/app/actions/linkPreview';
import { ORTHODOX_CATEGORIES } from '@/lib/constants/categories';
import type { LinkPreview, Post } from '@/lib/types/social';

// ─── Firebase AI (module-scope initialization) ────────────────────────────────

const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
const categoryModel = getGenerativeModel(ai, {
  model: 'gemini-2.0-flash',
  generationConfig: {
    responseMimeType: 'text/x.enum',
    responseSchema: Schema.enumString({
      enum: ORTHODOX_CATEGORIES as unknown as string[],
    }),
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const URL_REGEX = /https?:\/\/[^\s]+/;

// ─── ComposeBox ───────────────────────────────────────────────────────────────

interface ComposeBoxProps {
  uid: string;
  onPostCreated: (post: Post) => void;
}

export default function ComposeBox({ uid, onPostCreated }: ComposeBoxProps) {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedText = useDebounce(text, 800);
  const debouncedUrl = useDebounce(text.match(URL_REGEX)?.[0] ?? null, 1000);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // AI category classification
  useEffect(() => {
    if (!debouncedText || debouncedText.length < 20) {
      setSuggestedCategory(null);
      setClassifying(false);
      return;
    }
    if (selectedCategory) return; // user already picked manually

    let cancelled = false;
    setClassifying(true);
    categoryModel
      .generateContent(
        `Classify this Eastern Orthodox Christian social media post into exactly one of the provided categories. Post: "${debouncedText}"`,
      )
      .then((result) => {
        if (cancelled) return;
        const suggestion = result.response.text().trim();
        if (ORTHODOX_CATEGORIES.includes(suggestion as (typeof ORTHODOX_CATEGORIES)[number])) {
          setSuggestedCategory(suggestion);
        } else {
          setSuggestedCategory(null);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestedCategory(null);
      })
      .finally(() => {
        if (!cancelled) setClassifying(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedText, selectedCategory]);

  // Link preview fetch
  useEffect(() => {
    if (!debouncedUrl) {
      setLinkPreview(null);
      return;
    }
    let cancelled = false;
    setFetchingPreview(true);
    fetchLinkPreview(debouncedUrl)
      .then((preview) => {
        if (!cancelled) setLinkPreview(preview);
      })
      .catch(() => {
        if (!cancelled) setLinkPreview(null);
      })
      .finally(() => {
        if (!cancelled) setFetchingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedUrl]);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Image must be under 10 MB.');
        return;
      }

      setUploadError(null);
      setUploadProgress(0);

      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `posts/${uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        },
        (err) => {
          setUploadError('Upload failed. Please try again.');
          setUploadProgress(null);
          console.error(err);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(url);
          setUploadProgress(null);
        },
      );
    },
    [uid],
  );

  const effectiveCategory = selectedCategory ?? suggestedCategory;

  async function handleSubmit() {
    if (!text.trim()) return;
    if (!effectiveCategory) {
      setSubmitError('Please select a category before posting.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createPost(uid, {
        text: text.trim(),
        imageUrl,
        category: effectiveCategory,
        commentsRestricted: 'all',
        linkPreview,
      });

      if (!result.success) {
        setSubmitError(result.error ?? 'Your post could not be shared. Please try again.');
        return;
      }

      // Optimistic: build a Post-like object to prepend to feed
      const newPost: Post = {
        postId: result.postId,
        authorUid: uid,
        authorHandle: '',
        authorDisplayName: '',
        authorAvatarUrl: null,
        authorJurisdictionId: null,
        authorRoleLevel: 1,
        text: text.trim(),
        imageUrl,
        category: effectiveCategory,
        searchKeywords: [],
        likeCount: 0,
        commentCount: 0,
        commentsRestricted: 'all',
        linkPreview,
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as unknown as import('firebase/firestore').Timestamp,
        updatedAt: null,
        isEdited: false,
      };

      // Reset form
      setText('');
      setImageUrl(null);
      setSuggestedCategory(null);
      setSelectedCategory(null);
      setLinkPreview(null);
      setShowCategoryPicker(false);

      onPostCreated(newPost);
    } catch {
      setSubmitError('Your post could not be shared. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const showAISuggestion = suggestedCategory && !selectedCategory && !classifying;
  const showManualPicker = !showAISuggestion && text.length >= 20 && !classifying;
  const showPrompt = text.length < 20 || (!showAISuggestion && !classifying);

  return (
    <Card className="p-6">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share in the Agora..."
        rows={3}
        className="w-full bg-navy-light border border-gold/[0.15] rounded-md p-4 font-garamond text-base text-text-light placeholder:text-text-mid resize-none overflow-hidden focus:outline-none focus:border-gold/40 transition-colors"
        style={{ minHeight: '80px' }}
      />

      {/* Link preview */}
      {linkPreview && !fetchingPreview && (
        <div className="mt-2 bg-navy-light border border-gold/[0.10] rounded-md overflow-hidden">
          {linkPreview.imageUrl && (
            <img
              src={linkPreview.imageUrl}
              alt={linkPreview.title ?? 'Link preview'}
              className="w-full h-[80px] object-cover"
            />
          )}
          <div className="px-3 py-2">
            {linkPreview.title && (
              <p className="font-cinzel text-xs text-text-light truncate">{linkPreview.title}</p>
            )}
            {linkPreview.description && (
              <p className="font-garamond text-sm text-text-mid line-clamp-1">
                {linkPreview.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Category section */}
      <div className="mt-3">
        {classifying && (
          <p className="font-cinzel text-xs text-text-mid uppercase tracking-widest">
            Classifying...
          </p>
        )}

        {showAISuggestion && (
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs text-gold-dim uppercase tracking-widest">
              Suggested: {suggestedCategory}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSuggestedCategory(null);
                setShowCategoryPicker(true);
              }}
              className="font-cinzel text-xs text-gold hover:text-gold-bright underline transition-colors"
            >
              Change
            </button>
          </div>
        )}

        {(showPrompt || showCategoryPicker) && (
          <div>
            <p className="font-cinzel text-xs text-text-mid uppercase tracking-widest mb-2">
              {selectedCategory ? `Category: ${selectedCategory}` : 'What best describes this post?'}
            </p>
            <div className="flex flex-wrap gap-2">
              {ORTHODOX_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSuggestedCategory(null);
                    setShowCategoryPicker(false);
                  }}
                  className={`font-cinzel text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
                    selectedCategory === cat
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-gold/[0.15] text-gold-dim hover:border-gold/40 hover:text-gold'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedCategory && !showCategoryPicker && (
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs text-gold-dim uppercase tracking-widest">
              {selectedCategory}
            </span>
            <button
              type="button"
              onClick={() => setShowCategoryPicker(true)}
              className="font-cinzel text-xs text-gold hover:text-gold-bright underline transition-colors"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Image upload area */}
      {uploadProgress !== null && (
        <div className="mt-3">
          <div className="h-1 bg-navy-light rounded overflow-hidden">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="font-cinzel text-xs text-text-mid mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}

      {imageUrl && (
        <div className="mt-3 relative inline-block">
          <img src={imageUrl} alt="Attached" className="max-h-40 rounded-md object-cover" />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="absolute top-1 right-1 bg-navy p-1 rounded-full text-text-mid hover:text-gold"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {uploadError && (
        <p className="font-garamond italic text-xs text-crimson mt-2">{uploadError}</p>
      )}

      {submitError && (
        <p className="font-garamond italic text-xs text-crimson mt-2">{submitError}</p>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-11 h-11 flex items-center justify-center rounded border border-gold/[0.15] text-text-mid hover:text-gold hover:border-gold/40 transition-colors focus-visible:ring-2 focus-visible:ring-gold/60"
          aria-label="Attach photo"
        >
          <ImageIcon size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        <Button
          variant="gold"
          size="md"
          disabled={!text.trim() || submitting}
          loading={submitting}
          onClick={handleSubmit}
        >
          Share to Agora
        </Button>
      </div>
    </Card>
  );
}
