/**
 * Ekklesia Agora — Super Admin Seed Script
 *
 * Sets the initial super admin (roleLevel: 4) for the application.
 * Run once after project setup, before the app goes live.
 *
 * Usage:
 *   SUPER_ADMIN_EMAIL=your@email.com npm run seed:admin
 *
 * This script uses Firebase Admin SDK directly — it is NOT a Next.js module.
 * It reads service account credentials from environment variables (same as .env.local).
 *
 * SECURITY NOTE: Only run this script in a trusted server environment.
 * The FIREBASE_PRIVATE_KEY gives full admin access to the Firebase project.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from project root
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
// Fallback to .env if .env.local doesn't exist
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const SUPER_ADMIN_ROLE_LEVEL = 4;

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;

  if (!email) {
    console.error('ERROR: SUPER_ADMIN_EMAIL environment variable is required.');
    console.error('Usage: SUPER_ADMIN_EMAIL=your@email.com npm run seed:admin');
    process.exit(1);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.error('ERROR: Firebase Admin SDK credentials are missing.');
    console.error('Ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set.');
    process.exit(1);
  }

  // Initialize Firebase Admin (only once)
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({ projectId, privateKey, clientEmail }),
    });
  }

  const auth = getAuth();
  const db = getFirestore();

  console.log(`Looking up user with email: ${email} ...`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/user-not-found') {
      console.error(`ERROR: No Firebase Auth user found with email: ${email}`);
      console.error('The user must register through the app first before being promoted to super admin.');
      process.exit(1);
    }
    throw err;
  }

  const { uid } = userRecord;
  console.log(`Found user: uid=${uid}`);

  // Set custom claim
  await auth.setCustomUserClaims(uid, { roleLevel: SUPER_ADMIN_ROLE_LEVEL });
  console.log(`Set custom claim: { roleLevel: ${SUPER_ADMIN_ROLE_LEVEL} }`);

  // Sync to Firestore users document
  await db.collection('users').doc(uid).set(
    {
      roleLevel: SUPER_ADMIN_ROLE_LEVEL,
      email,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`Updated Firestore users/${uid} with roleLevel: ${SUPER_ADMIN_ROLE_LEVEL}`);

  // Log to audit trail
  await db.collection('roleAuditLog').add({
    targetUid: uid,
    newRole: SUPER_ADMIN_ROLE_LEVEL,
    promotedBy: 'seed-script',
    timestamp: FieldValue.serverTimestamp(),
  });
  console.log('Audit log entry created in roleAuditLog collection.');

  console.log('');
  console.log('Super admin setup complete.');
  console.log(`User ${email} (uid: ${uid}) is now a Super Admin (roleLevel: 4).`);
  console.log('IMPORTANT: The user must log out and log back in for the new role to take effect.');
  console.log('Their ID token must refresh before the roleLevel claim appears in session cookies.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
