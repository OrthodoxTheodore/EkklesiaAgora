"use client";

import Link from "next/link";
import { useState } from "react";

export const inputClass =
  "mt-1 w-full border border-buff bg-parchment px-3 py-2 text-ink placeholder:text-ink-soft/60 disabled:opacity-60";

export function Label({ text, hint, children }: { text: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm uppercase tracking-[0.15em] text-ink-soft">{text}</span>
      {hint && <span className="block text-sm italic text-ink-soft/80">{hint}</span>}
      {children}
    </label>
  );
}

// A password box with a Show/Hide button so people can check what they typed.
export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative mt-1 block">
      <input {...props} type={visible ? "text" : "password"} className={`${inputClass.replace("mt-1 ", "")} pr-20`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 px-3 text-sm italic text-claret hover:underline"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </span>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "danger" }) {
  const styles = {
    primary: "bg-continental text-parchment hover:bg-continental-deep",
    outline: "border border-continental text-continental hover:bg-continental/5",
    danger: "border border-claret text-claret hover:bg-claret/5",
  }[variant];
  return (
    <button
      {...props}
      className={`px-5 py-2.5 font-display text-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    />
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  const styles = {
    info: "border-buff bg-parchment-deep/60 text-ink-soft",
    error: "border-claret bg-claret/5 text-claret",
    success: "border-ulster bg-ulster/5 text-ulster",
  }[tone];
  return <div className={`border-l-4 px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-2 border-buff bg-parchment p-6 shadow-sm sm:p-8 ${className}`}>{children}</div>;
}

export function MembershipComingSoon() {
  return (
    <Panel>
      <p className="font-display text-2xl text-continental">Membership is opening soon</p>
      <p className="mt-2 text-ink-soft">
        Family accounts are being set up. In the meantime you can still{" "}
        <Link href="/connect/" className="text-claret underline">
          send in your line
        </Link>
        .
      </p>
    </Panel>
  );
}

export function Loading() {
  return <p className="py-10 text-center italic text-ink-soft">Loading…</p>;
}
