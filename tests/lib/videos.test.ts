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
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----\\n';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildVideoSearchKeywords } = require('@/lib/firestore/videos');

describe('buildVideoSearchKeywords', () => {
  test('tokenizes title words of 3+ chars', () => {
    const result = buildVideoSearchKeywords('Holy Liturgy', '', []);
    expect(result).toContain('holy');
    expect(result).toContain('liturgy');
  });

  test('includes description tokens', () => {
    const result = buildVideoSearchKeywords('Title', 'Byzantine chanting', []);
    expect(result).toContain('byzantine');
    expect(result).toContain('chanting');
  });

  test('includes tag tokens', () => {
    const result = buildVideoSearchKeywords('Title', '', ['Orthodox', 'Prayer']);
    expect(result).toContain('orthodox');
    expect(result).toContain('prayer');
  });

  test('deduplicates tokens', () => {
    const result = buildVideoSearchKeywords('Holy Holy', 'Holy', ['Holy']);
    const holyCount = result.filter((t: string) => t === 'holy').length;
    expect(holyCount).toBe(1);
  });

  test('filters tokens shorter than 3 chars', () => {
    const result = buildVideoSearchKeywords('A to be or', '', []);
    expect(result).not.toContain('to');
    expect(result).not.toContain('be');
    expect(result).not.toContain('or');
  });
});
