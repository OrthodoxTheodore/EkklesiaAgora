// Pure logic — no Next.js or Firebase imports
// Supports future React Native code sharing (DES-03)

export const ROLE_LEVELS = {
  guest: 0,
  registered: 1,
  moderator: 2,
  admin: 3,
  superAdmin: 4,
} as const;

export type RoleLevel = typeof ROLE_LEVELS[keyof typeof ROLE_LEVELS];

export type RoleName = keyof typeof ROLE_LEVELS;

// Reverse map for display purposes
export const ROLE_NAMES: Record<number, RoleName> = {
  0: 'guest',
  1: 'registered',
  2: 'moderator',
  3: 'admin',
  4: 'superAdmin',
};

/**
 * Returns true if the user's role level meets or exceeds the required level.
 * Used in both Firestore rules (numeric comparison) and client-side UI gating.
 */
export function isAtLeast(userLevel: number, requiredLevel: RoleLevel): boolean {
  return userLevel >= requiredLevel;
}

/**
 * Returns a human-readable display name for a role level.
 */
export function getRoleName(level: number): string {
  const name = ROLE_NAMES[level];
  if (!name) return 'unknown';
  // Convert camelCase to Title Case for display
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}
