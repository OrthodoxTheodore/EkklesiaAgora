import '@testing-library/jest-dom';

describe('Role claims (AUTH-06, AUTH-07)', () => {
  test.todo('setUserRole sets custom claims via Admin SDK');
  test.todo('setUserRole logs to roleAuditLog collection');
  test.todo('super admin can set any role level');
  test.todo('admin can set up to moderator but not admin or super admin');
  test.todo('non-admin caller is rejected');
});
