// Mock server-only — throws at import time outside Next.js
jest.mock('server-only', () => ({}));

// Mock firebase-admin packages so the admin SDK doesn't try to load ESM deps
jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn(() => [{ name: '[DEFAULT]' }]),
  initializeApp: jest.fn(),
  cert: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(),
  })),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

// Set minimal env vars so admin.ts doesn't throw
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY =
  '-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----\\n';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getConversationId } = require('@/lib/firestore/messages');

describe('getConversationId', () => {
  test('sorts uids alphabetically', () => {
    const result = getConversationId('z-uid', 'a-uid');
    expect(result).toBe('a-uid_z-uid');
  });

  test('is deterministic — both orderings return the same ID', () => {
    const id1 = getConversationId('user-abc', 'user-xyz');
    const id2 = getConversationId('user-xyz', 'user-abc');
    expect(id1).toBe(id2);
  });

  test('with identical uids returns same_same', () => {
    const result = getConversationId('same', 'same');
    expect(result).toBe('same_same');
  });
});
