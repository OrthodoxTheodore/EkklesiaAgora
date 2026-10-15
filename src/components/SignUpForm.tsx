"use client";

import { useState } from "react";
import { friendlyError, signInWithGoogle, signUpWithEmail } from "@/lib/account";
import { Button, inputClass, Label, Notice } from "./ui";

export function SignUpForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password.length < 8) return setError("Please choose a password of at least 8 characters.");
    setBusy(true);
    setError("");
    try {
      await signUpWithEmail(String(f.get("name")).trim(), String(f.get("email")).trim(), password);
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button type="button" variant="outline" className="w-full" onClick={google} disabled={busy}>
        Continue with Google
      </Button>
      <p className="text-center text-sm italic text-ink-soft">or create an account with your email</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Label text="Your full name">
          <input name="name" required autoComplete="name" className={inputClass} />
        </Label>
        <Label text="Email">
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </Label>
        <Label text="Password" hint="At least 8 characters">
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
        </Label>
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
