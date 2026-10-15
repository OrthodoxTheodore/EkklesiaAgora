"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { MembershipStatus } from "@/components/MembershipStatus";
import { Button, Loading, MembershipComingSoon, Panel } from "@/components/ui";
import { auth, firebaseReady } from "@/lib/firebase";

export function AccountView() {
  const { ready, user, profile, isAdmin } = useAuth();

  if (!firebaseReady) return <MembershipComingSoon />;
  if (!ready) return <Loading />;
  if (!user) {
    return (
      <Panel>
        <p className="font-display text-2xl text-continental">You are not signed in</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/signin/" className="bg-continental px-5 py-2.5 font-display text-lg text-parchment">
            Sign In
          </Link>
          <Link href="/join/" className="border border-continental px-5 py-2.5 font-display text-lg text-continental">
            Join the Family
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-8">
      <MembershipStatus />
      <Panel>
        <p className="eyebrow">Signed In As</p>
        <p className="mt-2 font-display text-xl text-continental">{profile?.displayName || user.displayName}</p>
        <p className="text-ink-soft">{user.email}</p>
        {isAdmin && (
          <p className="mt-2 text-sm text-ulster">
            Site admin ·{" "}
            <Link href="/admin/" className="underline">
              Open the admin page
            </Link>
          </p>
        )}
        <Button variant="outline" className="mt-5" onClick={() => signOut(auth())}>
          Sign Out
        </Button>
      </Panel>
    </div>
  );
}
