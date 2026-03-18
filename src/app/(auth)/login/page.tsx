'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseApp from '@/lib/firebase/client';
import { loginSchema, type LoginFormData } from '@/lib/auth/schemas';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const auth = getAuth(firebaseApp);

      // 1. Authenticate with Firebase
      const { user } = await signInWithEmailAndPassword(auth, data.email, data.password);

      // 2. Get ID token and create session cookie
      const idToken = await user.getIdToken();
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      // 3. Navigate to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setServerError('Invalid email or password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setServerError('Too many failed attempts. Please try again later.');
          break;
        default:
          setServerError('Sign in failed. Please try again.');
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-cinzel text-gold text-2xl uppercase tracking-widest mb-2">
          Sign In
        </h1>
        <p className="font-garamond text-text-mid text-sm">
          Welcome back to the Agora
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
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
          Sign In
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3 mt-6">
        <Link
          href="/reset-password"
          className="font-garamond text-text-mid text-sm hover:text-gold transition-colors"
        >
          Forgot your password?
        </Link>
        <p className="font-garamond text-text-mid text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-gold hover:text-gold-bright underline-offset-2 hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </Card>
  );
}
