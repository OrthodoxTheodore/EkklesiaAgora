export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTokens } from 'next-firebase-auth-edge';
import { Card } from '@/components/ui/Card';
import { ROLE_LEVELS, getRoleName } from '@/lib/firebase/roles';
import { UserRoleManager } from '@/components/admin/UserRoleManager';
import type { RoleLevel } from '@/lib/firebase/roles';

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

/**
 * Administration page — Server Component with defense-in-depth role check.
 *
 * SECURITY NOTE: Middleware blocks unauthenticated access, but this page adds
 * a second layer by verifying roleLevel >= admin (3) in the Server Component
 * itself. This prevents any middleware bypass (e.g., CVE-2025-29927 style
 * attacks) from exposing admin functionality.
 *
 * Requires: admin (3) or super admin (4) role.
 * Non-admin authenticated users are redirected to /dashboard.
 */
export default async function AdminPage() {
  const tokens = await getTokens(await cookies(), authConfig);

  // Unauthenticated — middleware should have caught this, but guard here too
  if (!tokens) {
    redirect('/login');
  }

  const { decodedToken } = tokens;
  const callerUid: string = decodedToken.uid;
  const callerRoleLevel: number =
    (decodedToken as { roleLevel?: number }).roleLevel ?? ROLE_LEVELS.guest;
  const callerRoleName = getRoleName(callerRoleLevel);

  // Defense-in-depth: redirect non-admins away (middleware only checks auth, not role)
  if (callerRoleLevel < ROLE_LEVELS.admin) {
    redirect('/dashboard');
  }

  const email = decodedToken.email ?? callerUid;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* ── Page Heading ──────────────────────────────────────────────────── */}
      <h1 className="font-cinzel text-gold text-2xl uppercase tracking-widest mb-2">
        Administration
      </h1>
      <p className="font-garamond text-text-mid text-base mb-10">
        Signed in as{' '}
        <span className="text-text-light">{email}</span>
        {' — '}
        <span className="text-gold">{callerRoleName}</span>
      </p>

      {/* ── Caller role context card ───────────────────────────────────────── */}
      <div className="mb-8">
        <Card>
          <h2 className="font-cinzel text-text-light text-sm uppercase tracking-widest mb-3">
            Your Permissions
          </h2>
          <p className="font-garamond text-text-mid text-sm leading-relaxed">
            {callerRoleLevel >= ROLE_LEVELS.superAdmin ? (
              <>
                As <span className="text-gold">Super Admin</span>, you can assign any role,
                including Admin and Super Admin.
              </>
            ) : (
              <>
                As <span className="text-gold">Admin</span>, you can assign the{' '}
                <span className="text-text-light">Registered</span> and{' '}
                <span className="text-text-light">Moderator</span> roles. To create another
                Admin, contact a Super Admin.
              </>
            )}
          </p>
        </Card>
      </div>

      {/* ── User Role Manager (Client Component) ──────────────────────────── */}
      <UserRoleManager callerRoleLevel={callerRoleLevel as RoleLevel} />
    </div>
  );
}
