"use client";

import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button, inputClass, Label, MembershipComingSoon, Notice, Panel, PasswordInput } from "@/components/ui";
import { friendlyError, signInWithGoogle } from "@/lib/account";
import { auth, firebaseReady } from "@/lib/firebase";
import { googleSignIn } from "@/lib/firebase-config";

export function SignInForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) router.replace("/account/");
  }, [user, router]);

  if (!firebaseReady) return <MembershipComingSoon />;

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    run(() => signInWithEmailAndPassword(auth(), email.trim(), password));
  }

  function resetPassword() {
    if (!email.trim()) return setError("Enter your email above first, then choose “Forgot password.”");
    run(async () => {
      await sendPasswordResetEmail(auth(), email.trim());
      setMessage("If that address has an account, a password reset link is on its way.");
    });
  }

  return (
    <Panel className="space-y-6">
      {googleSignIn && (
        <>
          <Button type="button" variant="outline" className="w-full" onClick={() => run(signInWithGoogle)} disabled={busy}>
            Continue with Google
          </Button>
          <p className="text-center text-sm italic text-ink-soft">or sign in with your email</p>
        </>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <Label text="Email">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Label>
        <Label text="Password">
          <PasswordInput name="password" required autoComplete="current-password" />
        </Label>
        {error && <Notice tone="error">{error}</Notice>}
        {message && <Notice tone="success">{message}</Notice>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </Button>
      </form>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <button type="button" onClick={resetPassword} className="italic text-claret underline">
          Forgot password?
        </button>
        <Link href="/join/" className="text-claret underline">
          New here? Join the family
        </Link>
      </div>
    </Panel>
  );
}
