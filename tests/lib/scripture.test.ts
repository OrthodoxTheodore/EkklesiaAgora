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

// where(...).where(...).orderBy(...) or where(...).limit(...)
mockWhere.mockReturnValue({
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  get: mockGet,
});

const mockCollection = jest.fn(() => ({
  where: mockWhere,
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
const { buildVerseKeywords, getChapter, searchVerses, getBooks, getBookMeta } = require('@/lib/firestore/scripture');

// ── buildVerseKeywords ────────────────────────────────────────────────────────

describe('buildVerseKeywords', () => {
  test('filters words shorter than 3 chars', () => {
    const result = buildVerseKeywords('In the beginning God created');
    // "In" (2 chars) must be excluded
    expect(result).not.toContain('in');
    // "the" (3 chars) IS included
    expect(result).toContain('the');
    expect(result).toContain('beginning');
    expect(result).toContain('god');
    expect(result).toContain('created');
  });

  test('deduplicates repeated tokens', () => {
    const result = buildVerseKeywords('And God said, God said');
    const godCount = result.filter((t: string) => t === 'god').length;
    const saidCount = result.filter((t: string) => t === 'said').length;
    expect(godCount).toBe(1);
    expect(saidCount).toBe(1);
    expect(result).toContain('and');
  });

  test('returns lowercased tokens', () => {
    const result = buildVerseKeywords('GENESIS EXODUS');
    expect(result).toContain('genesis');
    expect(result).toContain('exodus');
    expect(result).not.toContain('GENESIS');
  });
});

// ── getChapter ────────────────────────────────────────────────────────────────

describe('getChapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWhere.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });
    mockCollection.mockReturnValue({ where: mockWhere });
  });

  test('returns ordered verses for translation+book+chapter', async () => {
    const mockVerses = [
      { verseId: 'brenton_genesis_1_1', verse: 1, text: 'In the beginning...' },
      { verseId: 'brenton_genesis_1_2', verse: 2, text: 'And the earth was...' },
    ];
    mockGet.mockResolvedValue({
      docs: mockVerses.map(v => ({ data: () => v })),
    });
    mockOrderBy.mockReturnValue({ get: mockGet, limit: mockLimit, orderBy: mockOrderBy });

    const result = await getChapter('brenton', 'genesis', 1);
    expect(result).toHaveLength(2);
    expect(result[0].verseId).toBe('brenton_genesis_1_1');
    expect(result[1].verseId).toBe('brenton_genesis_1_2');
  });
});

// ── searchVerses ──────────────────────────────────────────────────────────────

describe('searchVerses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWhere.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });
    mockCollection.mockReturnValue({ where: mockWhere });
  });

  test('returns matching verses for keyword search', async () => {
    const mockVerses = [
      { verseId: 'brenton_john_3_16', text: 'For God so loved the world...' },
    ];
    mockGet.mockResolvedValue({
      docs: mockVerses.map(v => ({ data: () => v })),
    });

    const result = await searchVerses('loved');
    expect(result).toHaveLength(1);
    expect(result[0].verseId).toBe('brenton_john_3_16');
  });

  test('filters by translationId when provided', async () => {
    mockGet.mockResolvedValue({ docs: [] });

    await searchVerses('grace', 'eob_nt');
    // Should have added a where clause for translationId
    expect(mockWhere).toHaveBeenCalledWith('translationId', '==', 'eob_nt');
  });

  test('returns empty array for empty query string', async () => {
    const result = await searchVerses('');
    expect(result).toEqual([]);
  });
});

// ── getBooks ──────────────────────────────────────────────────────────────────

describe('getBooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWhere.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });
    mockCollection.mockReturnValue({ where: mockWhere });
  });

  test('returns books ordered by bookIndex', async () => {
    const mockBooks = [
      { bookId: 'brenton_genesis', bookIndex: 1, bookName: 'Genesis' },
      { bookId: 'brenton_exodus', bookIndex: 2, bookName: 'Exodus' },
    ];
    mockGet.mockResolvedValue({
      docs: mockBooks.map(b => ({ data: () => b })),
    });
    mockOrderBy.mockReturnValue({ get: mockGet, limit: mockLimit, orderBy: mockOrderBy });

    const result = await getBooks('brenton');
    expect(result).toHaveLength(2);
    expect(result[0].bookIndex).toBe(1);
    expect(result[1].bookIndex).toBe(2);
  });
});

// ── getBookMeta ───────────────────────────────────────────────────────────────

describe('getBookMeta', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWhere.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });
    mockCollection.mockReturnValue({ where: mockWhere });
  });

  test('resolves bookAbbrev to ScriptureBook metadata', async () => {
    const mockBook = { bookId: 'brenton_genesis', bookAbbrev: 'genesis', bookName: 'Genesis' };
    mockGet.mockResolvedValue({
      empty: false,
      docs: [{ data: () => mockBook }],
    });

    const result = await getBookMeta('genesis');
    expect(result).not.toBeNull();
    expect(result?.bookId).toBe('brenton_genesis');
  });

  test('returns null when bookAbbrev not found', async () => {
    mockGet.mockResolvedValue({ empty: true, docs: [] });

    const result = await getBookMeta('nonexistent');
    expect(result).toBeNull();
  });
});
