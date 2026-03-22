export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { fetchDayData } from '@/lib/calendar/orthocal';
import { getProfileByUid } from '@/lib/firestore/profiles';
import { CalendarDayView } from '@/components/calendar/CalendarDayView';
import { CalendarSkeleton } from '@/components/calendar/CalendarSkeleton';
import type { CalendarSystem } from '@/lib/types/calendar';

const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: 'AuthToken',
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT!,
    process.env.COOKIE_SECRET_PREVIOUS!,
  ],
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY!.includes('-----BEGIN') ? process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n') : Buffer.from(process.env.FIREBASE_PRIVATE_KEY!, 'base64').toString('utf-8')),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; cal?: string }>;
}) {
  const params = await searchParams;

  // Determine civil date — use ?date=YYYY-MM-DD param or today
  const civilDate = params.date
    ? new Date(params.date + 'T12:00:00')
    : new Date();

  // Determine calendar preference — default to new_julian for guests
  let calendar: CalendarSystem = 'new_julian';
  let isLoggedIn = false;

  try {
    const tokens = await getTokens(await cookies(), authConfig);
    if (tokens) {
      isLoggedIn = true;
      const profile = await getProfileByUid(tokens.decodedToken.uid);
      if (
        profile?.calendarPreference === 'new_julian' ||
        profile?.calendarPreference === 'old_julian'
      ) {
        calendar = profile.calendarPreference as CalendarSystem;
      }
    }
  } catch {
    // Guest user — use default new_julian
  }

  // Allow URL override (for guest toggling or logged-in navigation)
  if (params.cal === 'old_julian' || params.cal === 'new_julian') {
    calendar = params.cal;
  }

  // Fetch liturgical day data from orthocal.info
  const dayData = await fetchDayData(civilDate, calendar);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-6">
        Liturgical Calendar
      </h1>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarDayView
          initialDay={dayData}
          initialCalendar={calendar}
          isLoggedIn={isLoggedIn}
        />
      </Suspense>
    </div>
  );
}
