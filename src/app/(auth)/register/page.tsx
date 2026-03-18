'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseApp from '@/lib/firebase/client';
import { registerSchema, type RegisterFormData } from '@/lib/auth/schemas';
import { registerUser } from '@/app/actions/auth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const auth = getAuth(firebaseApp);

      // 1. Create Firebase user
      const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);

      // 2. Create initial session cookie (roleLevel not yet set)
      const idToken = await user.getIdToken();
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      // 3. Set roleLevel: 1 (registered) via Server Action, also creates userProfiles doc
      await registerUser(user.uid, user.email!);

      // 4. Force token refresh to pick up new roleLevel claim
      const refreshedToken = await user.getIdToken(true);

      // 5. Update session cookie with refreshed token containing roleLevel
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: refreshedToken }),
      });

      // 6. Navigate to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          setServerError('An account with this email already exists. Please sign in.');
          break;
        case 'auth/weak-password':
          setServerError('Password is too weak. Please choose a stronger password.');
          break;
        case 'auth/invalid-email':
          setServerError('The email address is not valid.');
          break;
        default:
          setServerError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-cinzel text-gold text-2xl uppercase tracking-widest mb-2">
          Create Your Account
        </h1>
        <p className="font-garamond text-text-mid text-sm">
          Join the Orthodox community
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <Input
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {serverError && (
          <p role="alert" className="font-garamond italic text-sm text-crimson text-center">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          variant="gold"
          size="lg"
          loading={isSubmitting}
          className="w-full mt-2"
        >
          Create Account
        </Button>
      </form>

      <p className="font-garamond text-text-mid text-sm text-center mt-6">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-gold hover:text-gold-bright underline-offset-2 hover:underline transition-colors"
        >
          Sign In
        </Link>
      </p>
    </Card>
  );
}
