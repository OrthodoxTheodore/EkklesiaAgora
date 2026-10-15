"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, firebaseReady } from "@/lib/firebase";
import type { Profile } from "@/lib/types";

type AuthState = {
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  isMember: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthState>({
  ready: false,
  user: null,
  profile: null,
  isMember: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(!firebaseReady);

  useEffect(() => {
    if (!firebaseReady) return;
    let stopProfile: (() => void) | undefined;
    const stopAuth = onAuthStateChanged(auth(), (u) => {
      stopProfile?.();
      setUser(u);
      if (!u) {
        setProfile(null);
        setReady(true);
        return;
      }
      stopProfile = onSnapshot(
        doc(db(), "users", u.uid),
        (snap) => {
          setProfile(snap.exists() ? (snap.data() as Profile) : null);
          setReady(true);
        },
        () => setReady(true),
      );
    });
    return () => {
      stopProfile?.();
      stopAuth();
    };
  }, []);

  const isMember = profile?.status === "member";
  const isAdmin = isMember && profile?.role === "admin";

  return <AuthContext.Provider value={{ ready, user, profile, isMember, isAdmin }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
