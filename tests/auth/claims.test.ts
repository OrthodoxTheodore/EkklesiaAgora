import '@testing-library/jest-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Mock `server-only` — this package throws at import time outside Next.js.
// In Jest (Node env) we stub it to a no-op so server-only modules can be tested.
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('server-only', () => ({}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock firebase-admin/firestore
// ─────────────────────────────────────────────────────────────────────────────
const mockFirestoreSet = jest.fn().mockResolvedValue(undefined);
const mockFirestoreAdd = jest.fn().mockResolvedValue({ id: 'audit-log-id' });
const mockFirestoreDoc = jest.fn(() => ({ set: mockFirestoreSet }));
const mockFirestoreCollection = jest.fn((name: string) => {
  if (name === 'roleAuditLog') {
    return { add: mockFirestoreAdd };
  }
  return { doc: mockFirestoreDoc };
});

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: mockFirestoreCollection,
  })),
  FieldValue: {
    serverTimestamp: jest.fn(() => ({ _type: 'serverTimestamp' })),
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock firebase-admin/auth
// ─────────────────────────────────────────────────────────────────────────────
const mockSetCustomUserClaims = jest.fn().mockResolvedValue(undefined);
const mockGetUser = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    setCustomUserClaims: mockSetCustomUserClaims,
    getUser: mockGetUser,
  })),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Mock firebase-admin/app (required by admin.ts)
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn(() => [{ name: '[DEFAULT]' }]),
  initializeApp: jest.fn(),
  cert: jest.fn(),
}));

// Set minimal env vars so admin.ts doesn't throw on .replace()
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----\\n';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';

// Import after all mocks are in place
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { setUserRole, getUserRoleLevel } = require('@/lib/auth/claims');

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Role claims (AUTH-06, AUTH-07)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFirestoreCollection.mockImplementation((name: string) => {
      if (name === 'roleAuditLog') {
        return { add: mockFirestoreAdd };
      }
      return { doc: mockFirestoreDoc };
    });
    mockFirestoreDoc.mockReturnValue({ set: mockFirestoreSet });
    mockFirestoreSet.mockResolvedValue(undefined);
    mockFirestoreAdd.mockResolvedValue({ id: 'audit-log-id' });
  });

  test('setUserRole sets custom claims via Admin SDK', async () => {
    await setUserRole('uid-123', 2, 'admin-uid');

    expect(mockSetCustomUserClaims).toHaveBeenCalledTimes(1);
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith('uid-123', { roleLevel: 2 });
  });

  test('setUserRole logs to roleAuditLog collection', async () => {
    await setUserRole('uid-123', 2, 'admin-uid');

    expect(mockFirestoreAdd).toHaveBeenCalledTimes(1);
    expect(mockFirestoreAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        targetUid: 'uid-123',
        newRole: 2,
        promotedBy: 'admin-uid',
      }),
    );
  });

  test('setUserRole updates the users Firestore document', async () => {
    await setUserRole('uid-123', 2, 'admin-uid');

    // The users collection doc should be set with merge
    expect(mockFirestoreDoc).toHaveBeenCalledWith('uid-123');
    expect(mockFirestoreSet).toHaveBeenCalledWith(
      expect.objectContaining({ roleLevel: 2 }),
      { merge: true },
    );
  });

  test('getUserRoleLevel returns claim from user record', async () => {
    mockGetUser.mockResolvedValue({
      uid: 'uid-123',
      customClaims: { roleLevel: 3 },
    });

    const level = await getUserRoleLevel('uid-123');
    expect(level).toBe(3);
  });

  test('getUserRoleLevel falls back to guest (0) when no claim set', async () => {
    mockGetUser.mockResolvedValue({
      uid: 'uid-456',
      customClaims: null,
    });

    const level = await getUserRoleLevel('uid-456');
    expect(level).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Permission logic tests for promoteUser Server Action
// These test the business rules in actions.ts using a mocked version of claims.ts
// ─────────────────────────────────────────────────────────────────────────────
describe('promoteUser permission logic (AUTH-07)', () => {
  // Mock next/headers and next-firebase-auth-edge to control the caller's token
  const mockGetTokens = jest.fn();

  jest.mock('next/headers', () => ({
    cookies: jest.fn().mockResolvedValue({}),
  }));

  jest.mock('next-firebase-auth-edge', () => ({
    getTokens: (...args: unknown[]) => mockGetTokens(...args),
  }));

  jest.mock('@/lib/auth/claims', () => ({
    setUserRole: jest.fn().mockResolvedValue(undefined),
    searchUsersByEmail: jest.fn().mockResolvedValue([]),
  }));

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { promoteUser } = require('@/app/(main)/admin/actions');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { setUserRole: mockSetUserRole } = require('@/lib/auth/claims');

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: set env vars for authConfig
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key';
    process.env.COOKIE_SECRET_CURRENT = 'secret-current-32-chars-xxxxxxxxxxx';
    process.env.COOKIE_SECRET_PREVIOUS = 'secret-previous-32-chars-xxxxxxxxxx';
  });

  test('non-admin caller (roleLevel < 3) is rejected', async () => {
    mockGetTokens.mockResolvedValue({
      decodedToken: { uid: 'caller-uid', roleLevel: 1 },
    });

    const result = await promoteUser({ targetUid: 'target-uid', newRole: 2 });

    expect(result).toEqual(
      expect.objectContaining({ error: expect.stringContaining('Insufficient') }),
    );
    expect(mockSetUserRole).not.toHaveBeenCalled();
  });

  test('admin (roleLevel 3) can promote user to moderator (2)', async () => {
    mockGetTokens.mockResolvedValue({
      decodedToken: { uid: 'admin-uid', roleLevel: 3 },
    });

    const result = await promoteUser({ targetUid: 'target-uid', newRole: 2 });

    expect(result).toEqual({ success: true });
    expect(mockSetUserRole).toHaveBeenCalledWith('target-uid', 2, 'admin-uid');
  });

  test('admin (roleLevel 3) cannot promote to admin (3) or above', async () => {
    mockGetTokens.mockResolvedValue({
      decodedToken: { uid: 'admin-uid', roleLevel: 3 },
    });

    const result = await promoteUser({ targetUid: 'target-uid', newRole: 3 });

    expect(result).toEqual(
      expect.objectContaining({ error: expect.stringContaining('moderator') }),
    );
    expect(mockSetUserRole).not.toHaveBeenCalled();
  });

  test('super admin (roleLevel 4) can set any role level', async () => {
    mockGetTokens.mockResolvedValue({
      decodedToken: { uid: 'superadmin-uid', roleLevel: 4 },
    });

    // Super admin promoting to admin (3)
    const result = await promoteUser({ targetUid: 'target-uid', newRole: 3 });

    expect(result).toEqual({ success: true });
    expect(mockSetUserRole).toHaveBeenCalledWith('target-uid', 3, 'superadmin-uid');
  });

  test('privilege escalation is prevented (admin cannot set role >= own level)', async () => {
    mockGetTokens.mockResolvedValue({
      decodedToken: { uid: 'admin-uid', roleLevel: 3 },
    });

    // Admin trying to set another user to admin (same level) — should be blocked
    // (admin can only set up to moderator per the first guard, but testing escalation logic)
    const result = await promoteUser({ targetUid: 'target-uid', newRole: 3 });

    expect(result).toEqual(
      expect.objectContaining({ error: expect.any(String) }),
    );
    expect(mockSetUserRole).not.toHaveBeenCalled();
  });

  test('unauthenticated caller (no tokens) is rejected', async () => {
    mockGetTokens.mockResolvedValue(null);

    const result = await promoteUser({ targetUid: 'target-uid', newRole: 1 });

    expect(result).toEqual(
      expect.objectContaining({ error: expect.stringContaining('authenticated') }),
    );
  });
});
