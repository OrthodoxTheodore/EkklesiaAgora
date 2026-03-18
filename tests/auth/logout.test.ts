import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Mock firebase/auth
// ---------------------------------------------------------------------------
const mockSignOut = jest.fn().mockResolvedValue(undefined);

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  onIdTokenChanged: jest.fn(),
}));

jest.mock('@/lib/firebase/client', () => ({}));

// Mock useAuth to return an authenticated user directly
// This avoids needing to wrap in AuthProvider and deal with async state
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: {
      email: 'user@orthodox.org',
      displayName: null,
      uid: 'test-uid',
    },
    loading: false,
  }),
}));

// Mock next/navigation
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

// Mock global fetch
const mockFetch = jest.fn().mockResolvedValue({ ok: true });
global.fetch = mockFetch;

// Mock next/image (used in Navbar)
jest.mock('next/image', () => {
  const MockImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement('img', props);
  MockImage.displayName = 'Image';
  return MockImage;
});

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children);
  MockLink.displayName = 'Link';
  return MockLink;
});

// Mock MobileMenu
jest.mock('@/components/nav/MobileMenu', () => ({
  MobileMenu: () => null,
}));

// Import Navbar AFTER mocks
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Navbar } = require('@/components/nav/Navbar');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Logout (AUTH-04)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
    mockSignOut.mockResolvedValue(undefined);
  });

  test('logout calls signOut to clear client auth state', async () => {
    render(React.createElement(Navbar));

    // Open the avatar dropdown
    const avatarButton = screen.getByRole('button', { name: /user menu/i });
    fireEvent.click(avatarButton);

    // Click Sign Out
    const signOutButton = await screen.findByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  test('POST /api/logout is called to clear session cookie', async () => {
    render(React.createElement(Navbar));

    const avatarButton = screen.getByRole('button', { name: /user menu/i });
    fireEvent.click(avatarButton);

    const signOutButton = await screen.findByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/logout', { method: 'POST' });
    });
  });

  test('user is redirected to home after logout', async () => {
    render(React.createElement(Navbar));

    const avatarButton = screen.getByRole('button', { name: /user menu/i });
    fireEvent.click(avatarButton);

    const signOutButton = await screen.findByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });
});
