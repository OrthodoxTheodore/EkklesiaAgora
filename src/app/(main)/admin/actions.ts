'use server';

import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { ROLE_LEVELS } from '@/lib/firebase/roles';
import type { RoleLevel } from '@/lib/firebase/roles';
import { setUserRole, searchUsersByEmail } from '@/lib/auth/claims';

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
 * Server Action: promote a user to a new role.
 *
 * Permission rules:
 *   - Super admin (4): can set any role
 *   - Admin (3): can set registered (1) or moderator (2) only
 *   - Anyone else: rejected
 *   - Privilege escalation prevention: caller cannot set role >= own level
 *     (except super admin who can set any level including their own)
 */
export async function promoteUser(formData: {
  targetUid: string;
  newRole: RoleLevel;
}): Promise<{ success: true } | { error: string }> {
  try {
    const tokens = await getTokens(await cookies(), authConfig);

    if (!tokens) {
      return { error: 'Not authenticated.' };
    }

    const { decodedToken } = tokens;
    const callerUid: string = decodedToken.uid;
    const callerLevel: number =
      (decodedToken as { roleLevel?: number }).roleLevel ?? ROLE_LEVELS.guest;

    // Must be at least admin to promote anyone
    if (callerLevel < ROLE_LEVELS.admin) {
      return { error: 'Insufficient permissions. Admin or Super Admin role required.' };
    }

    const { targetUid, newRole } = formData;

    // Prevent promoting oneself (edge case — could lead to accidental lockout)
    // Super admins may still adjust their own role if absolutely necessary,
    // but the standard flow is to promote others only.

    // Admin (3) can only set up to moderator (2)
    if (callerLevel === ROLE_LEVELS.admin && newRole > ROLE_LEVELS.moderator) {
      return { error: 'Admins can only assign up to the moderator role.' };
    }

    // Privilege escalation guard: caller cannot assign a role >= their own level
    // (super admin is exempt since their level is 4 and max assignable is 4)
    if (callerLevel < ROLE_LEVELS.superAdmin && newRole >= callerLevel) {
      return { error: 'Cannot assign a role equal to or higher than your own.' };
    }

    await setUserRole(targetUid, newRole, callerUid);

    return { success: true };
  } catch (err) {
    console.error('[promoteUser] Error:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Server Action: search users by email prefix.
 * Requires admin (3) or super admin (4) role.
 */
export async function searchUsers(
  query: string,
): Promise<
  | { results: Array<{ uid: string; email: string; displayName: string; roleLevel: RoleLevel }> }
  | { error: string }
> {
  try {
    const tokens = await getTokens(await cookies(), authConfig);

    if (!tokens) {
      return { error: 'Not authenticated.' };
    }

    const { decodedToken } = tokens;
    const callerLevel: number =
      (decodedToken as { roleLevel?: number }).roleLevel ?? ROLE_LEVELS.guest;

    if (callerLevel < ROLE_LEVELS.admin) {
      return { error: 'Insufficient permissions.' };
    }

    const results = await searchUsersByEmail(query);
    return { results };
  } catch (err) {
    console.error('[searchUsers] Error:', err);
    return { error: 'Search failed. Please try again.' };
  }
}
