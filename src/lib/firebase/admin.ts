// server-only guard — prevents this module from being imported in client components
import 'server-only';

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

function parsePrivateKey(raw: string): string {
  // If it already looks like a PEM key, just fix escaped newlines
  if (raw.includes('-----BEGIN')) {
    return raw.replace(/\\n/g, '\n');
  }
  // Otherwise assume base64-encoded
  return Buffer.from(raw, 'base64').toString('utf-8');
}

function getAdminApp(): App {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY!),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
    });
  } else {
    adminApp = getApps()[0];
  }
  return adminApp;
}

export const getAdminAuth = () => getAuth(getAdminApp());
export const getAdminFirestore = () => getFirestore(getAdminApp());
