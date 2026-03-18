import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import { Card } from '@/components/ui/Card';
import { getRoleName } from '@/lib/firebase/roles';

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

/**
 * Dashboard — protected Server Component.
 * Defense-in-depth: verifies auth here even though middleware also blocks unauthenticated access.
 * This prevents any middleware bypass from exposing the page.
 */
export default async function DashboardPage() {
  // getTokens reads the session cookie and validates it server-side
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    redirect('/login');
  }

  const { decodedToken } = tokens;
  const email = decodedToken.email ?? 'Unknown user';
  const roleLevel = (decodedToken as { roleLevel?: number }).roleLevel ?? 0;
  const roleName = getRoleName(roleLevel);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-cinzel text-gold text-2xl uppercase tracking-widest mb-8">
        Welcome, {email}
      </h1>

      <div className="grid gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-cinzel text-text-light text-sm uppercase tracking-widest mb-2">
                Account Status
              </h2>
              <p className="font-garamond text-text-mid text-base">
                Role:{' '}
                <span className="text-gold">{roleName}</span>
              </p>
              <p className="font-garamond text-text-mid text-base">
                Email:{' '}
                <span className="text-text-light">{email}</span>
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-cinzel text-text-light text-sm uppercase tracking-widest mb-3">
            Your Orthodox Community Awaits
          </h2>
          <p className="font-garamond text-text-mid text-base leading-relaxed">
            Features coming soon. The Agora, video library, Scripture reader, and liturgical
            calendar are being built in the phases ahead.
          </p>
        </Card>
      </div>
    </div>
  );
}
