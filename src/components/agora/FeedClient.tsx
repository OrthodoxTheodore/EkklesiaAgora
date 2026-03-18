'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  getDocs,
  DocumentSnapshot,
  getDoc,
  doc,
} from 'firebase/firestore';
import firebaseApp from '@/lib/firebase/client';
import type { Post } from '@/lib/types/social';
import PostCard from '@/components/agora/PostCard';
import ComposeBox from '@/components/agora/ComposeBox';
import CategoryFilterTabs from '@/components/agora/CategoryFilterTabs';
import BlockingSkeletons from '@/components/agora/BlockingSkeletons';

const PAGE_SIZE = 10;

interface FeedClientProps {
  uid: string;
}

export default function FeedClient({ uid }: FeedClientProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const db = getFirestore(firebaseApp);

  // Load blocked and muted user lists on mount
  useEffect(() => {
    async function loadBlockMuteLists() {
      try {
        const blockedSnap = await getDocs(
          collection(db, 'userBlocks', uid, 'blocked'),
        );
        setBlockedUsers(blockedSnap.docs.map((d) => d.id));

        const mutedSnap = await getDocs(
          collection(db, 'userMutes', uid, 'muted'),
        );
        setMutedUsers(mutedSnap.docs.map((d) => d.id));
      } catch {
        // Non-critical: continue without block/mute lists
      }
    }
    loadBlockMuteLists();
  }, [uid, db]);

  // Load feed posts (initial or on category change)
  const loadFeed = useCallback(
    async (cursor: DocumentSnapshot | null = null) => {
      const isFirstPage = cursor === null;
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);

      try {
        const feedRef = collection(db, 'users', uid, 'userFeed');
        let q;
        if (activeCategory) {
          q = cursor
            ? query(
                feedRef,
                where('category', '==', activeCategory),
                orderBy('createdAt', 'desc'),
                startAfter(cursor),
                limit(PAGE_SIZE),
              )
            : query(
                feedRef,
                where('category', '==', activeCategory),
                orderBy('createdAt', 'desc'),
                limit(PAGE_SIZE),
              );
        } else {
          q = cursor
            ? query(feedRef, orderBy('createdAt', 'desc'), startAfter(cursor), limit(PAGE_SIZE))
            : query(feedRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
        }

        const snap = await getDocs(q);
        const fetched = snap.docs.map((d) => d.data() as Post);
        const filtered = fetched.filter(
          (p) => !blockedUsers.includes(p.authorUid) && !mutedUsers.includes(p.authorUid),
        );

        if (isFirstPage) {
          setPosts(filtered);
        } else {
          setPosts((prev) => [...prev, ...filtered]);
        }

        setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
        setHasMore(snap.docs.length === PAGE_SIZE);
      } catch (err) {
        console.error('Feed load error:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [db, uid, activeCategory, blockedUsers, mutedUsers],
  );

  // Initial load + category change
  useEffect(() => {
    if (debouncedSearch.length >= 3) return; // search mode active
    setLastDoc(null);
    setPosts([]);
    setHasMore(true);
    loadFeed(null);
  }, [activeCategory, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search query
  useEffect(() => {
    if (debouncedSearch.length < 3) {
      if (debouncedSearch.length === 0) {
        // cleared search — normal feed will reload via activeCategory effect
      }
      return;
    }
    setSearchLoading(true);
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('searchKeywords', 'array-contains', debouncedSearch.toLowerCase()),
      orderBy('createdAt', 'desc'),
      limit(20),
    );
    getDocs(q)
      .then((snap) => {
        const results = snap.docs.map((d) => d.data() as Post);
        const filtered = results.filter(
          (p) => !blockedUsers.includes(p.authorUid) && !mutedUsers.includes(p.authorUid),
        );
        setPosts(filtered);
      })
      .catch((err) => console.error('Search error:', err))
      .finally(() => setSearchLoading(false));
  }, [debouncedSearch, db, blockedUsers, mutedUsers]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !loading &&
          debouncedSearch.length < 3
        ) {
          loadFeed(lastDoc);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, lastDoc, loadFeed, debouncedSearch]);

  function handlePostCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handlePostDeleted(postId: string) {
    setPosts((prev) => prev.filter((p) => p.postId !== postId));
  }

  function handleCategoryChange(category: string | null) {
    setActiveCategory(category);
    setSearchTerm('');
    setDebouncedSearch('');
  }

  const isSearchMode = debouncedSearch.length >= 3;

  return (
    <div className="flex flex-col gap-4">
      {/* Compose box */}
      <ComposeBox uid={uid} onPostCreated={handlePostCreated} />

      {/* Search input */}
      <input
        type="search"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (e.target.value.length === 0) {
            setActiveCategory(activeCategory); // trigger feed reload
          }
        }}
        className="w-full bg-navy-light border border-gold/[0.15] rounded-md px-4 py-2 font-garamond text-base text-text-light placeholder:text-text-mid focus:border-gold/40 focus:outline-none mb-3"
      />

      {/* Category filter tabs (hidden in search mode) */}
      {!isSearchMode && (
        <CategoryFilterTabs
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {/* Feed content */}
      {loading || searchLoading ? (
        <BlockingSkeletons />
      ) : isSearchMode ? (
        <>
          {posts.length === 0 ? (
            <p className="font-garamond text-text-mid text-center py-8">
              No posts found for &quot;{debouncedSearch}&quot;
            </p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                currentUserUid={uid}
                onPostDeleted={handlePostDeleted}
              />
            ))
          )}
        </>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="font-cinzel text-text-light text-lg uppercase tracking-widest mb-3">
            The Agora is quiet
          </h2>
          <p className="font-garamond text-text-mid text-base">
            Follow other members to see their posts here. Start by exploring profiles.
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              currentUserUid={uid}
              onPostDeleted={handlePostDeleted}
            />
          ))}

          {/* Load-more sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {loadingMore && (
            <div className="flex justify-center py-4">
              <svg
                className="animate-spin h-6 w-6 text-gold"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="Loading more posts"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="font-cinzel text-xs text-text-mid text-center uppercase tracking-widest py-4">
              You&apos;ve reached the beginning
            </p>
          )}
        </>
      )}
    </div>
  );
}
