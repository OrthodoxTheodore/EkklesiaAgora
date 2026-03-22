import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from 'next-firebase-auth-edge';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const diagnostics: Record<string, unknown> = {};

  // 1. Check env vars
  diagnostics.hasApiKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  diagnostics.hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
  diagnostics.hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
  diagnostics.hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
  diagnostics.hasCookieSecret = !!process.env.COOKIE_SECRET_CURRENT;
  diagnostics.privateKeyStart = process.env.FIREBASE_PRIVATE_KEY?.substring(0, 20) ?? 'MISSING';

  // 2. Parse private key
  try {
    const raw = process.env.FIREBASE_PRIVATE_KEY!;
    let parsed: string;
    if (raw.includes('-----BEGIN')) {
      parsed = raw.replace(/\\n/g, '\n');
      diagnostics.keyFormat = 'PEM';
    } else {
      parsed = Buffer.from(raw, 'base64').toString('utf-8');
      diagnostics.keyFormat = 'base64';
    }
    diagnostics.parsedKeyStart = parsed.substring(0, 30);
    diagnostics.parsedKeyValid = parsed.includes('-----BEGIN PRIVATE KEY-----');
  } catch (e) {
    diagnostics.keyParseError = String(e);
  }

  // 3. Check cookies
  const cookieHeader = request.headers.get('cookie') ?? '';
  const authCookies = cookieHeader.split(';').filter(c => c.trim().startsWith('AuthToken'));
  diagnostics.authCookieCount = authCookies.length;
  diagnostics.hasAuthCookie = authCookies.length > 0;

  // 4. Verify tokens if cookies exist
  if (authCookies.length > 0) {
    try {
      const raw = process.env.FIREBASE_PRIVATE_KEY!;
      const privateKey = raw.includes('-----BEGIN')
        ? raw.replace(/\\n/g, '\n')
        : Buffer.from(raw, 'base64').toString('utf-8');

      const tokens = await getTokens(request.cookies, {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
        cookieName: 'AuthToken',
        cookieSignatureKeys: [
          process.env.COOKIE_SECRET_CURRENT!,
          process.env.COOKIE_SECRET_PREVIOUS!,
        ],
        serviceAccount: {
          projectId: process.env.FIREBASE_PROJECT_ID!,
          privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        },
      });

      if (tokens) {
        diagnostics.tokenValid = true;
        diagnostics.uid = tokens.decodedToken.uid;
        diagnostics.email = tokens.decodedToken.email;
      } else {
        diagnostics.tokenValid = false;
      }
    } catch (e) {
      diagnostics.tokenError = String(e);
    }
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
