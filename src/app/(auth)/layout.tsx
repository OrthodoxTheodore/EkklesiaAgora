import React from 'react';

/**
 * Auth route group layout.
 * Centers content vertically and horizontally, no additional nav chrome.
 * The root layout's Navbar still renders above via the parent layout.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      {children}
    </div>
  );
}
