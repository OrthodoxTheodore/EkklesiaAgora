import '@testing-library/jest-dom';
import { ROLE_LEVELS, isAtLeast, getRoleName } from '@/lib/firebase/roles';

describe('Role hierarchy (AUTH-08)', () => {
  test('ROLE_LEVELS has correct integer hierarchy', () => {
    expect(ROLE_LEVELS.guest).toBe(0);
    expect(ROLE_LEVELS.registered).toBe(1);
    expect(ROLE_LEVELS.moderator).toBe(2);
    expect(ROLE_LEVELS.admin).toBe(3);
    expect(ROLE_LEVELS.superAdmin).toBe(4);
  });

  test('isAtLeast returns true when user level >= required', () => {
    // Exact match
    expect(isAtLeast(2, 2)).toBe(true);
    // Higher than required
    expect(isAtLeast(3, 2)).toBe(true);
    // Super admin satisfies any level
    expect(isAtLeast(4, 1)).toBe(true);
    expect(isAtLeast(4, 4)).toBe(true);
    // Guest meets guest requirement
    expect(isAtLeast(0, 0)).toBe(true);
  });

  test('isAtLeast returns false when user level < required', () => {
    expect(isAtLeast(1, 2)).toBe(false);
    expect(isAtLeast(0, 1)).toBe(false);
    expect(isAtLeast(2, 3)).toBe(false);
    expect(isAtLeast(3, 4)).toBe(false);
  });

  test('guest (0) < registered (1) < moderator (2) < admin (3) < superAdmin (4)', () => {
    const levels = [
      ROLE_LEVELS.guest,
      ROLE_LEVELS.registered,
      ROLE_LEVELS.moderator,
      ROLE_LEVELS.admin,
      ROLE_LEVELS.superAdmin,
    ];

    // Every role is strictly greater than the previous one
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThan(levels[i - 1]);
    }

    // Full ordering check
    expect(ROLE_LEVELS.guest).toBeLessThan(ROLE_LEVELS.registered);
    expect(ROLE_LEVELS.registered).toBeLessThan(ROLE_LEVELS.moderator);
    expect(ROLE_LEVELS.moderator).toBeLessThan(ROLE_LEVELS.admin);
    expect(ROLE_LEVELS.admin).toBeLessThan(ROLE_LEVELS.superAdmin);
  });

  test('getRoleName returns display-friendly names', () => {
    expect(getRoleName(0)).toBe('Guest');
    expect(getRoleName(1)).toBe('Registered');
    expect(getRoleName(2)).toBe('Moderator');
    expect(getRoleName(3)).toBe('Admin');
    expect(getRoleName(4)).toBe('Super Admin');
    expect(getRoleName(99)).toBe('unknown');
  });
});
