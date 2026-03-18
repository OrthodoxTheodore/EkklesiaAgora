'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import firebaseApp from '@/lib/firebase/client';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/auth/schemas';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const auth = getAuth(firebaseApp);
    try {
      await sendPasswordResetEmail(auth, data.email);
    } catch {
      // Intentionally swallow errors — do NOT reveal whether the email exists
    } finally {
      // Always show success message regardless of whether email exists (anti-enumeration)
      setSubmitted(true);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-cinzel text-gold text-2xl uppercase tracking-widest mb-2">
          Reset Password
        </h1>
        <p className="font-garamond text-text-mid text-sm">
          Enter your email to receive a reset link
        </p>
      </div>

      {submitted ? (
        <div className="text-center flex flex-col gap-4">
          <p
            role="status"
            className="font-garamond text-text-light text-base leading-relaxed"
          >
            If an account exists with that email, a password reset link has been sent.
            Please check your inbox and spam folder.
          </p>
          <Link
            href="/login"
            className="font-cinzel text-xs uppercase tracking-widest text-gold hover:text-gold-bright transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <Input
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={isSubmitting}
              className="w-full mt-2"
            >
              Send Reset Link
            </Button>
          </form>

          <p className="font-garamond text-text-mid text-sm text-center mt-6">
            <Link
              href="/login"
              className="text-gold hover:text-gold-bright underline-offset-2 hover:underline transition-colors"
            >
              Back to Sign In
            </Link>
          </p>
        </>
      )}
    </Card>
  );
}
