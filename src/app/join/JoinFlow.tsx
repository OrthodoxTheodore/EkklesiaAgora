"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { MembershipStatus } from "@/components/MembershipStatus";
import { SignUpForm } from "@/components/SignUpForm";
import { Loading, MembershipComingSoon, Panel } from "@/components/ui";
import { firebaseReady } from "@/lib/firebase";

export function JoinFlow() {
  const { ready, user } = useAuth();

  if (!firebaseReady) return <MembershipComingSoon />;
  if (!ready) return <Loading />;
  if (user) return <MembershipStatus />;

  return (
    <Panel>
      <p className="eyebrow">Step 1 of 2</p>
      <h2 className="mt-2 mb-6 text-2xl text-continental">Create your account</h2>
      <SignUpForm />
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/signin/" className="text-claret underline">
          Sign in
        </Link>
      </p>
    </Panel>
  );
}
