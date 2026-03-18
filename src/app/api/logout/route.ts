import { NextRequest } from 'next/server';
import { removeAuthCookies } from 'next-firebase-auth-edge/next/cookies';

export async function POST(request: NextRequest) {
  const headers = new Headers(request.headers);

  return removeAuthCookies(headers, {
    cookieName: 'AuthToken',
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0,
    },
  });
}
