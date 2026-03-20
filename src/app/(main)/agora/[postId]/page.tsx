import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getPost } from '@/lib/firestore/posts';
import PostCard from '@/components/agora/PostCard';
import PostDetailClient from '@/components/agora/PostDetailClient';
import Link from 'next/link';

const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: 'AuthToken',
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT!,
    process.env.COOKIE_SECRET_PREVIOUS!,
  ],
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
};

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

/**
 * Post detail page at /agora/[postId] — Server Component.
 * Shows the full post and flat comment thread.
 * Stable permalink suitable for moderation review.
 */
export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    redirect('/login');
  }

  const { postId } = await params;
  const uid = tokens.decodedToken.uid;

  // Fetch post
  const post = await getPost(postId);
  if (!post) {
    notFound();
  }

  // Check if current user follows the post author (for follower-only comment restriction)
  let isFollowing = false;
  if (uid !== post.authorUid) {
    const db = getAdminFirestore();
    const followDoc = await db.collection('follows').doc(`${uid}_${post.authorUid}`).get();
    isFollowing = followDoc.exists;
  }

  const isPostAuthor = uid === post.authorUid;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/agora"
        className="font-cinzel text-xs uppercase tracking-widest text-text-mid hover:text-gold transition-colors mb-6 block"
      >
        &larr; Back to Agora
      </Link>

      {/* Full post */}
      <PostCard
        post={post}
        currentUserUid={uid}
      />

      {/* Comment thread */}
      <div className="mt-6">
        <PostDetailClient
          postId={postId}
          currentUserUid={uid}
          commentsRestricted={post.commentsRestricted}
          isFollowing={isFollowing}
          isPostAuthor={isPostAuthor}
        />
      </div>
    </div>
  );
}
