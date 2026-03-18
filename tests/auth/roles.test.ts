import '@testing-library/jest-dom';

describe('Role hierarchy (AUTH-08)', () => {
  test.todo('ROLE_LEVELS has correct integer hierarchy');
  test.todo('isAtLeast returns true when user level >= required');
  test.todo('isAtLeast returns false when user level < required');
  test.todo('guest (0) < registered (1) < moderator (2) < admin (3) < superAdmin (4)');
});
