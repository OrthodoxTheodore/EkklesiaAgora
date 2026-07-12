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

// Mock each of the sub-search modules
jest.mock('@/lib/firestore/videos');
jest.mock('@/lib/firestore/posts');
jest.mock('@/lib/firestore/synodeia');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { globalSearch } = require('@/lib/firestore/search');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { searchVideos } = require('@/lib/firestore/videos');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { searchPosts } = require('@/lib/firestore/posts');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { searchMembersByName } = require('@/lib/firestore/synodeia');

beforeEach(() => {
  jest.clearAllMocks();
  // Default: all return empty arrays
  searchVideos.mockResolvedValue([]);
  searchPosts.mockResolvedValue([]);
  searchMembersByName.mockResolvedValue([]);
});

describe('globalSearch', () => {
  test('globalSearch("") returns empty arrays for all types without calling sub-functions', async () => {
    const result = await globalSearch('');
    expect(result.videos).toEqual([]);
    expect(result.posts).toEqual([]);
    expect(result.people).toEqual([]);
    expect(searchVideos).not.toHaveBeenCalled();
    expect(searchPosts).not.toHaveBeenCalled();
    expect(searchMembersByName).not.toHaveBeenCalled();
  });

  test('globalSearch("grace") calls all search functions and aggregates results', async () => {
    const mockVideo = { videoId: 'v1', title: 'Grace Video' };
    const mockPost = { postId: 'p1', content: 'grace' };
    const mockPerson = { uid: 'u1', displayName: 'Grace Member' };

    searchVideos.mockResolvedValue([mockVideo]);
    searchPosts.mockResolvedValue([mockPost]);
    searchMembersByName.mockResolvedValue([mockPerson]);

    const result = await globalSearch('grace');

    expect(result.videos).toHaveLength(1);
    expect(result.posts).toHaveLength(1);
    expect(result.people).toHaveLength(1);
  });

  test('globalSearch("GRACE") lowercases the query before calling sub-functions', async () => {
    await globalSearch('GRACE');
    expect(searchVideos).toHaveBeenCalledWith('grace', 50);
    expect(searchPosts).toHaveBeenCalledWith('grace', 50);
    expect(searchMembersByName).toHaveBeenCalledWith('grace', null, 50);
  });

  test('globalSearch("  word  ") trims whitespace before calling sub-functions', async () => {
    await globalSearch('  word  ');
    expect(searchVideos).toHaveBeenCalledWith('word', 50);
    expect(searchPosts).toHaveBeenCalledWith('word', 50);
    expect(searchMembersByName).toHaveBeenCalledWith('word', null, 50);
  });
});
