import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ---------------------------------------------------------------------------
// Mock firebase/auth
// ---------------------------------------------------------------------------
const mockSendPasswordResetEmail = jest.fn();

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  sendPasswordResetEmail: (...args: unknown[]) => mockSendPasswordResetEmail(...args),
}));

jest.mock('@/lib/firebase/client', () => ({}));

// Mock next/navigation (reset page doesn't navigate, but imported by shared components)
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Import component AFTER mocks
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { default: ResetPasswordPage } = require('@/app/(auth)/reset-password/page');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Password reset (AUTH-03)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendPasswordResetEmail.mockResolvedValue(undefined);
  });

  test('renders reset password form with email field', () => {
    render(React.createElement(ResetPasswordPage));

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument();
  });

  test('calls sendPasswordResetEmail with the entered email on valid submit', async () => {
    render(React.createElement(ResetPasswordPage));

    await userEvent.type(screen.getByLabelText(/email address/i), 'priest@orthodox.org');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(), // auth instance
        'priest@orthodox.org',
      );
    });
  });

  test('shows success message without revealing whether email exists', async () => {
    render(React.createElement(ResetPasswordPage));

    await userEvent.type(screen.getByLabelText(/email address/i), 'nonexistent@example.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      const successMsg = screen.getByRole('status');
      expect(successMsg).toBeInTheDocument();
      // Success message should NOT confirm or deny email existence
      expect(successMsg.textContent).toMatch(/if an account exists/i);
      expect(successMsg.textContent).not.toMatch(/email (does not exist|not found|registered)/i);
    });

    // Form should be replaced by success state — no longer visible
    expect(screen.queryByRole('button', { name: /send reset link/i })).not.toBeInTheDocument();
  });

  test('still shows success message even when sendPasswordResetEmail throws', async () => {
    // Firebase throws auth/user-not-found when email doesn't exist
    // The reset page must swallow this error to prevent email enumeration
    mockSendPasswordResetEmail.mockRejectedValueOnce({
      code: 'auth/user-not-found',
      message: 'There is no user record corresponding to the provided identifier.',
    });

    render(React.createElement(ResetPasswordPage));

    await userEvent.type(screen.getByLabelText(/email address/i), 'ghost@example.com');
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      // Despite the error, success message should still appear
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
