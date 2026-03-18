'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="font-cinzel text-xs uppercase tracking-widest text-gold-dim"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? true : undefined}
          className={`
            bg-navy-light/50 border border-gold-dim rounded-md px-4 py-3
            text-text-light font-garamond text-base
            focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim
            transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-crimson focus:ring-crimson/40' : ''}
            ${className}
          `.trim()}
          {...rest}
        />
        {error && (
          <p
            id={`${id}-error`}
            role="alert"
            className="font-garamond italic text-xs text-gold-dim mt-0.5"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
