import { NextRequest } from 'next/server';
import { setAuthCookies } from 'next-firebase-auth-edge/next/cookies';

const authConfig = {
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
};

export async function POST(request: NextRequest) {
  const headers = new Headers(request.headers);
  return setAuthCookies(headers, authConfig);
}
