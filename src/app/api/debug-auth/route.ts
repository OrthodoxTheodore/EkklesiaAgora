import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: show diagnostics
export async function GET(request: NextRequest) {
  const diagnostics: Record<string, unknown> = {};
  
  diagnostics.hasApiKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  diagnostics.hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
  diagnostics.hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
  diagnostics.hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
  diagnostics.hasCookieSecret = !!process.env.COOKIE_SECRET_CURRENT;
  diagnostics.privateKeyStart = process.env.FIREBASE_PRIVATE_KEY?.substring(0, 20) ?? 'MISSING';

  const raw = process.env.FIREBASE_PRIVATE_KEY!;
  let parsed: string;
  if (raw.includes('-----BEGIN')) {
    parsed = raw.replace(/\\n/g, '\n');
    diagnostics.keyFormat = 'PEM';
  } else {
    parsed = Buffer.from(raw, 'base64').toString('utf-8');
    diagnostics.keyFormat = 'base64';
  }
  diagnostics.parsedKeyValid = parsed.includes('-----BEGIN PRIVATE KEY-----');
  
  // Check cookies
  const cookieHeader = request.headers.get('cookie') ?? '';
  const authCookies = cookieHeader.split(';').filter(c => c.trim().startsWith('AuthToken'));
  diagnostics.authCookieCount = authCookies.length;
  
  // Check all cookie names
  const allCookieNames = cookieHeader.split(';').map(c => c.trim().split('=')[0]).filter(Boolean);
  diagnostics.allCookieNames = allCookieNames;

  return NextResponse.json(diagnostics, { status: 200 });
}

// POST: test setAuthCookies directly  
export async function POST(request: NextRequest) {
  const { setAuthCookies } = await import('next-firebase-auth-edge/next/cookies');
  
  const diagnostics: Record<string, unknown> = {};
  
  try {
    const authHeader = request.headers.get('Authorization');
    diagnostics.hasAuthHeader = !!authHeader;
    diagnostics.authHeaderLength = authHeader?.length ?? 0;
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No Authorization header', diagnostics }, { status: 400 });
    }

    const raw = process.env.FIREBASE_PRIVATE_KEY!;
    const privateKey = raw.includes('-----BEGIN')
      ? raw.replace(/\\n/g, '\n')
      : Buffer.from(raw, 'base64').toString('utf-8');

    const response = await setAuthCookies(request.headers, {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      cookieName: 'AuthToken',
      cookieSignatureKeys: [
        process.env.COOKIE_SECRET_CURRENT!,
        process.env.COOKIE_SECRET_PREVIOUS!,
      ],
      cookieSerializeOptions: {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 12,
      },
      serviceAccount: {
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      },
    });

    diagnostics.responseStatus = response.status;
    diagnostics.responseBody = await response.clone().json().catch(() => 'parse error');
    diagnostics.hasCookieHeaders = (response.headers.getSetCookie?.()?.length ?? 0) > 0;
    diagnostics.cookieCount = response.headers.getSetCookie?.()?.length ?? 0;

    // Forward the Set-Cookie headers from setAuthCookies
    const finalResponse = NextResponse.json({ success: true, diagnostics });
    for (const cookie of response.headers.getSetCookie?.() ?? []) {
      finalResponse.headers.append('Set-Cookie', cookie);
    }
    return finalResponse;
  } catch (e) {
    diagnostics.error = String(e);
    return NextResponse.json({ error: String(e), diagnostics }, { status: 500 });
  }
}
