export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import Link from 'next/link';
import { getMembersByJurisdiction } from '@/lib/firestore/synodeia';
import { SynodeiaClient } from '@/components/synodeia/SynodeiaClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

export default async function SynodeiaPage() {
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card>
          <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-4">
            Sign in to find fellow Orthodox Christians
          </h1>
          <p className="font-garamond text-text-mid text-base mb-6">
            Synodeia is available to registered members.
          </p>
          <Link href="/login">
            <Button variant="gold" size="lg" className="w-full">
              Sign In to Synodeia
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const initialMembers = await getMembersByJurisdiction(null, 50);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-cinzel text-gold text-xl uppercase tracking-widest mb-2">
        Synodeia
      </h1>
      <p className="font-garamond text-text-mid text-base mb-6">
        Find Orthodox Christians by jurisdiction
      </p>
      <SynodeiaClient initialMembers={initialMembers} />
    </div>
  );
}
