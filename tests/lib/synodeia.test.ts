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
const { sanitizeMember, buildDisplayNameKeywords } = require('@/lib/firestore/synodeia');

describe('sanitizeMember', () => {
  const baseProfile = {
    uid: 'user1', handle: 'john_doe', displayName: 'John Doe',
    avatarUrl: null, jurisdictionId: 'oca',
    city: 'Atlanta', stateRegion: 'GA',
  };

  it('includes city and stateRegion when locationSharingEnabled is true', () => {
    const result = sanitizeMember({ ...baseProfile, locationSharingEnabled: true });
    expect(result.city).toBe('Atlanta');
    expect(result.stateRegion).toBe('GA');
  });

  it('strips city and stateRegion when locationSharingEnabled is false', () => {
    const result = sanitizeMember({ ...baseProfile, locationSharingEnabled: false });
    expect(result.city).toBeNull();
    expect(result.stateRegion).toBeNull();
  });

  it('strips city and stateRegion when locationSharingEnabled is undefined', () => {
    const result = sanitizeMember({ ...baseProfile });
    expect(result.city).toBeNull();
    expect(result.stateRegion).toBeNull();
  });
});

describe('buildDisplayNameKeywords', () => {
  it('generates prefix tokens for each word', () => {
    const result = buildDisplayNameKeywords('John Doe');
    expect(result).toContain('jo');
    expect(result).toContain('joh');
    expect(result).toContain('john');
    expect(result).toContain('do');
    expect(result).toContain('doe');
  });

  it('handles punctuation in names', () => {
    const result = buildDisplayNameKeywords("O'Brien");
    expect(result).toContain('br');
    expect(result).toContain('bri');
  });

  it('deduplicates tokens', () => {
    const result = buildDisplayNameKeywords('John John');
    const johnCount = result.filter((t: string) => t === 'john').length;
    expect(johnCount).toBe(1);
  });
});
