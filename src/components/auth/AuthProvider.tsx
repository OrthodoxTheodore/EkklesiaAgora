'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, User, getIdTokenResult } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase/client';
import { ROLE_LEVELS } from '@/lib/firebase/roles';
import type { RoleLevel } from '@/lib/firebase/roles';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** The user's roleLevel from their Firebase Auth custom claims. 0 = guest. */
  roleLevel: RoleLevel;
  /** The user's profile handle, e.g. "theodore". Null if not yet loaded. */
  handle: string | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  roleLevel: ROLE_LEVELS.guest,
  handle: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLevel, setRoleLevel] = useState<RoleLevel>(ROLE_LEVELS.guest);
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const tokenResult = await getIdTokenResult(firebaseUser);
          const level = (tokenResult.claims.roleLevel as number | undefined) ?? ROLE_LEVELS.guest;
          setRoleLevel(level as RoleLevel);
        } catch {
          setRoleLevel(ROLE_LEVELS.guest);
        }

        // Fetch handle from Firestore profile
        try {
          const db = getFirestore(firebaseApp);
          const snap = await getDoc(doc(db, 'userProfiles', firebaseUser.uid));
          if (snap.exists()) {
            setHandle((snap.data().handle as string) ?? null);
          }
        } catch {
          // non-fatal — nav falls back gracefully
        }
      } else {
        setRoleLevel(ROLE_LEVELS.guest);
        setHandle(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, roleLevel, handle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
