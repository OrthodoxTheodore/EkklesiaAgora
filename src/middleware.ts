import { authMiddleware, redirectToLogin, redirectToHome } from 'next-firebase-auth-edge';
import { NextRequest, NextResponse } from 'next/server';
import type { Tokens } from 'next-firebase-auth-edge';
import type { InvalidTokenReason } from 'next-firebase-auth-edge/auth/error';

const PRIVATE_PATHS = ['/dashboard', '/admin', '/profile', '/agora'];
const AUTH_PATHS = ['/login', '/register', '/reset-password'];

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    debug: true,
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: 'AuthToken',
    cookieSignatureKeys: [
      process.env.COOKIE_SECRET_CURRENT!,
      process.env.COOKIE_SECRET_PREVIOUS!,
    ],
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 12, // 12 days
    },
    serviceAccount: {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY!.includes('-----BEGIN') ? process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n') : Buffer.from(process.env.FIREBASE_PRIVATE_KEY!, 'base64').toString('utf-8')),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    },
    handleValidToken: async (_tokens: Tokens, headers: Headers) => {
      // Authenticated users are redirected away from auth pages
      if (AUTH_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))) {
        return redirectToHome(request);
      }
      return NextResponse.next({ request: { headers } });
    },
    handleInvalidToken: async (reason: InvalidTokenReason) => {
      void reason; // Intentionally unused — available for logging if needed
      // Unauthenticated users are blocked from private paths only
      // Public paths pass through without authentication (AUTH-05)
      if (PRIVATE_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))) {
        return redirectToLogin(request);
      }
      return NextResponse.next();
    },
    handleError: async (error: unknown) => {
      // Log and pass through — never block on middleware errors
      // SECURITY NOTE (CVE-2025-29927): middleware handles routing only.
      // Actual data security enforced in Firestore rules and Server Components.
      console.error('[Middleware] Auth error:', error);
      return NextResponse.next();
    },
  });
}

export const config = {
  matcher: ['/((?!_next|api/debug-auth|.*\\..*).*)', '/'],
};
