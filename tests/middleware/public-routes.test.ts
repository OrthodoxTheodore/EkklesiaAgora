import '@testing-library/jest-dom';

describe('Public route access (AUTH-05)', () => {
  test.todo('unauthenticated user can access / without redirect');
  test.todo('unauthenticated user accessing /dashboard is redirected to /login');
  test.todo('authenticated user accessing /login is redirected away');
  test.todo('static assets and _next paths are excluded from middleware');
});
