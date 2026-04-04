export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { fetchMonthData } from '@/lib/calendar/orthocal';
import { getProfileByUid } from '@/lib/firestore/profiles';
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView';
import { CalendarSkeleton } from '@/components/calendar/CalendarSkeleton';
import type { CalendarSystem } from '@/lib/types/calendar';

function getAuthConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: 'AuthToken',
    cookieSignatureKeys: [
      process.env.COOKIE_SECRET_CURRENT!,
      process.env.COOKIE_SECRET_PREVIOUS!,
    ],
    serviceAccount: {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: (
        (process.env.FIREBASE_PRIVATE_KEY ?? '').includes('-----BEGIN')
          ? process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
          : Buffer.from(process.env.FIREBASE_PRIVATE_KEY!, 'base64').toString('utf-8')
      ),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    },
  };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; cal?: string }>;
}) {
  const params = await searchParams;

  // Determine which month to show — default to current month
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;

  // Guard against invalid year/month
  const safeYear = Number.isFinite(year) && year >= 2000 && year <= 2100 ? year : now.getFullYear();
  const safeMonth = Number.isFinite(month) && month >= 1 && month <= 12 ? month : now.getMonth() + 1;

  // Determine calendar preference — default to new_julian for guests
  let calendar: CalendarSystem = 'new_julian';
  let isLoggedIn = false;

  try {
    const tokens = await getTokens(await cookies(), getAuthConfig());
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

  // Allow URL override (guest toggling or logged-in navigation)
  if (params.cal === 'old_julian' || params.cal === 'new_julian') {
    calendar = params.cal;
  }

  // Fetch all days for the month
  let monthData;
  try {
    monthData = await fetchMonthData(safeYear, safeMonth, calendar);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-6">
          Liturgical Calendar
        </h1>
        <div className="bg-navy-light border border-crimson/50 rounded-lg p-6 text-center space-y-3">
          <p className="font-cinzel text-gold-dim text-sm uppercase tracking-widest">
            Unable to load calendar data
          </p>
          <p className="font-garamond text-text-mid text-sm">{message}</p>
          <p className="font-garamond text-text-mid text-sm">
            The liturgical data service may be temporarily unavailable. Please try again in a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-6">
        Liturgical Calendar
      </h1>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarMonthView
          monthData={monthData}
          year={safeYear}
          month={safeMonth}
          calendar={calendar}
          isLoggedIn={isLoggedIn}
        />
      </Suspense>
    </div>
  );
}
