import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase/admin';
import ModerationConsoleClient from './ModerationConsoleClient';
import type { Video, Channel } from '@/lib/types/video';

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

interface Report {
  reportId: string;
  contentType: string;
  contentId: string;
  reason: string;
  status: string;
}

/**
 * Moderation console — Server Component with defense-in-depth role check.
 *
 * SECURITY NOTE: Requires moderator (2) or higher. This page adds a second
 * layer of role verification beyond middleware — any middleware bypass cannot
 * expose moderation actions.
 */
export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const tokens = await getTokens(await cookies(), authConfig);

  // Unauthenticated — middleware should have caught this, but guard here too
  if (!tokens) {
    redirect('/login');
  }

  const { decodedToken } = tokens;
  const roleLevel: number =
    (decodedToken as { roleLevel?: number }).roleLevel ?? 0;

  // Defense-in-depth: requires moderator (2) or higher
  if (roleLevel < 2) {
    redirect('/');
  }

  const db = getAdminFirestore();
  const adminAuth = getAdminAuth();

  const params = await searchParams;
  const tab = params.tab === 'flagged' ? 'flagged' : 'pending';

  // ── Pending Videos ──────────────────────────────────────────────────────────
  const pendingSnap = await db
    .collection('videos')
    .where('status', '==', 'pending_review')
    .orderBy('createdAt', 'asc')
    .limit(20)
    .get();

  const pendingVideos = pendingSnap.docs.map((d) => d.data() as Video);

  // Fetch uploader context for each pending video
  const pendingVideosWithContext = await Promise.all(
    pendingVideos.map(async (video) => {
      let uploaderPostCount = 0;
      let uploaderAccountAgeDays = 0;

      try {
        // Fetch post count from userProfiles
        const profileSnap = await db.collection('userProfiles').doc(video.uploaderUid).get();
        if (profileSnap.exists) {
          uploaderPostCount = (profileSnap.data() as { postCount?: number }).postCount ?? 0;
        }

        // Fetch account creation date from Firebase Auth
        const userRecord = await adminAuth.getUser(video.uploaderUid);
        if (userRecord.metadata.creationTime) {
          const createdMs = new Date(userRecord.metadata.creationTime).getTime();
          uploaderAccountAgeDays = Math.floor((Date.now() - createdMs) / 86400000);
        }
      } catch {
        // Non-fatal — continue with defaults
      }

      return { video, uploaderPostCount, uploaderAccountAgeDays };
    })
  );

  // ── Channel Applications ────────────────────────────────────────────────────
  const channelsSnap = await db
    .collection('channels')
    .where('status', '==', 'pending_approval')
    .orderBy('createdAt', 'asc')
    .get();

  const channelApplications = channelsSnap.docs.map((d) => d.data() as Channel);

  // ── Flagged Videos ──────────────────────────────────────────────────────────
  const reportsSnap = await db
    .collection('reports')
    .where('contentType', '==', 'video')
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();

  const allReports = reportsSnap.docs.map((d) => ({
    reportId: d.id,
    ...(d.data() as Omit<Report, 'reportId'>),
  }));

  // Group reports by videoId
  const reportsByVideoId: Record<string, { reasons: string[]; count: number }> = {};
  for (const report of allReports) {
    const videoId = report.contentId;
    if (!reportsByVideoId[videoId]) {
      reportsByVideoId[videoId] = { reasons: [], count: 0 };
    }
    reportsByVideoId[videoId].count++;
    if (report.reason && !reportsByVideoId[videoId].reasons.includes(report.reason)) {
      reportsByVideoId[videoId].reasons.push(report.reason);
    }
  }

  // Fetch each flagged video
  const flaggedVideos = await Promise.all(
    Object.entries(reportsByVideoId).map(async ([videoId, data]) => {
      const videoSnap = await db.collection('videos').doc(videoId).get();
      if (!videoSnap.exists) return null;
      const video = videoSnap.data() as Video;
      return {
        video,
        flagReasons: data.reasons,
        flagCount: data.count,
      };
    })
  );

  // Filter out nulls (videos that were deleted)
  const validFlaggedVideos = flaggedVideos.filter(
    (fv): fv is { video: Video; flagReasons: string[]; flagCount: number } => fv !== null
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Page Heading */}
      <h1 className="font-cinzel text-2xl font-bold text-gold mb-8">
        Content Moderation
      </h1>

      <ModerationConsoleClient
        initialTab={tab}
        initialPendingVideos={pendingVideosWithContext}
        initialFlaggedVideos={validFlaggedVideos}
        initialChannelApplications={channelApplications}
      />
    </div>
  );
}
