import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ---------------------------------------------------------------------------
// Mock firebase/auth — must be before component import
// ---------------------------------------------------------------------------
const mockCreateUser = jest.fn();
const mockGetIdToken = jest.fn();

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUser(...args),
}));

// Mock the Firebase client singleton
jest.mock('@/lib/firebase/client', () => ({}));

// Mock next/navigation
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

// Mock the server action
jest.mock('@/app/actions/auth', () => ({
  registerUser: jest.fn().mockResolvedValue(undefined),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import component AFTER mocks
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { default: RegisterPage } = require('@/app/(auth)/register/page');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Registration flow (AUTH-01)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
    mockGetIdToken.mockResolvedValue('mock-id-token');
    mockCreateUser.mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        getIdToken: mockGetIdToken,
      },
    });
  });

  test('renders registration form with email, password, confirm password fields', () => {
    render(React.createElement(RegisterPage));

    // Heading
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();

    // Form fields (by label)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();

    // Sign in link
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  test('shows validation error for weak password (less than 8 chars)', async () => {
    render(React.createElement(RegisterPage));

    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'abc');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'abc');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });

    // Firebase should NOT have been called
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  test('shows validation error for mismatched passwords', async () => {
    render(React.createElement(RegisterPage));

    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'ValidPass1');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'DifferentPass1');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  test('calls createUserWithEmailAndPassword on valid submit', async () => {
    render(React.createElement(RegisterPage));

    await userEvent.type(screen.getByLabelText(/email address/i), 'test@orthodox.org');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'ValidPass1');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'ValidPass1');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        'test@orthodox.org',
        'ValidPass1',
      );
    });

    // Session cookie creation should have been called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/login',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
