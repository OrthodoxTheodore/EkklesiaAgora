// Mock server-only — throws at import time outside Next.js
jest.mock('server-only', () => ({}));

// Mock firebase-admin packages so the admin SDK doesn't try to load ESM deps
jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn(() => [{ name: '[DEFAULT]' }]),
  initializeApp: jest.fn(),
  cert: jest.fn(),
}));

// Firestore mock — chainable query builder
const mockGet = jest.fn();
const mockLimit = jest.fn(() => ({ get: mockGet }));
const mockOrderBy = jest.fn(() => ({ get: mockGet, limit: mockLimit, orderBy: jest.fn() }));
const mockWhere = jest.fn();

mockWhere.mockReturnValue({
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  get: mockGet,
});

const mockDocGet = jest.fn();
const mockDoc = jest.fn(() => ({ get: mockDocGet }));

const mockCollection = jest.fn(() => ({
  where: mockWhere,
  orderBy: mockOrderBy,
  doc: mockDoc,
  get: mockGet,
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: mockCollection,
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
const {
  buildPatristicKeywords,
  searchPatristicTexts,
  getAuthor,
  getAuthorTexts,
} = require('@/lib/firestore/patristic');

// ── buildPatristicKeywords ────────────────────────────────────────────────────

describe('buildPatristicKeywords', () => {
  test('returns array of lowercased tokens', () => {
    const result = buildPatristicKeywords(
      'Epistle to the Ephesians',
      'Ignatius of Antioch',
      ['Holy Fathers', 'Church History'],
      'Let us all run together as into one temple of God, as to one altar, as to one Jesus Christ'
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(150);
    result.forEach((token: string) => {
      expect(token).toBe(token.toLowerCase());
    });
  });

  test('includes title and author tokens', () => {
    const result = buildPatristicKeywords(
      'Epistle to the Ephesians',
      'Ignatius of Antioch',
      ['Holy Fathers'],
      'Some body text about unity and the Church and faith in God and love'
    );
    expect(result).toContain('epistle');
    expect(result).toContain('ignatius');
    expect(result).toContain('antioch');
  });

  test('respects maxBodyWords cap', () => {
    const longBody = Array.from({ length: 1000 }, (_, i) => `word${i}unique`).join(' ');
    const result = buildPatristicKeywords(
      'Short Title',
      'Short Author',
      [],
      longBody,
      5
    );
    // With maxBodyWords=5 the body sample window is 15 raw tokens; result must fit in 150 cap
    expect(result.length).toBeLessThanOrEqual(150);
    // Should not include tokens from far into the body (index > 15)
    const bodyTokensInResult = result.filter((t: string) => t.startsWith('word'));
    expect(bodyTokensInResult.length).toBeLessThanOrEqual(15);
  });
});

// ── searchPatristicTexts ──────────────────────────────────────────────────────

describe('searchPatristicTexts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWhere.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });
    mockCollection.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy, doc: mockDoc, get: mockGet });
  });

  test('returns empty array for empty query', async () => {
    const result = await searchPatristicTexts('');
    expect(result).toEqual([]);
  });

  test('returns empty array for whitespace-only query', async () => {
    const result = await searchPatristicTexts('   ');
    expect(result).toEqual([]);
  });
});

// ── getAuthor ─────────────────────────────────────────────────────────────────

describe('getAuthor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy, doc: mockDoc, get: mockGet });
  });

  test('returns null for missing slug', async () => {
    mockDocGet.mockResolvedValue({ exists: false, data: () => null });

    const result = await getAuthor('nonexistent-slug');
    expect(result).toBeNull();
  });

  test('returns author data when doc exists', async () => {
    const mockAuthor = {
      authorSlug: 'ignatius-of-antioch',
      name: 'Ignatius of Antioch',
      era: 'apostolic',
    };
    mockDocGet.mockResolvedValue({ exists: true, data: () => mockAuthor });

    const result = await getAuthor('ignatius-of-antioch');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Ignatius of Antioch');
  });
});

// ── getAuthorTexts ────────────────────────────────────────────────────────────

describe('getAuthorTexts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWhere.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });
    mockCollection.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy, doc: mockDoc, get: mockGet });
  });

  test('returns ordered texts as array of 2', async () => {
    const mockTexts = [
      { textId: 'ignatius-ephesians', sortOrder: 1, title: 'Epistle to the Ephesians' },
      { textId: 'ignatius-magnesians', sortOrder: 2, title: 'Epistle to the Magnesians' },
    ];
    mockOrderBy.mockReturnValue({ get: mockGet, limit: mockLimit, orderBy: mockOrderBy });
    mockGet.mockResolvedValue({
      docs: mockTexts.map(t => ({ data: () => t })),
    });

    const result = await getAuthorTexts('ignatius-of-antioch');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });
});
