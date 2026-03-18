'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, User, getIdTokenResult } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import firebaseApp from '@/lib/firebase/client';
import { ROLE_LEVELS } from '@/lib/firebase/roles';
import type { RoleLevel } from '@/lib/firebase/roles';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** The user's roleLevel from their Firebase Auth custom claims. 0 = guest. */
  roleLevel: RoleLevel;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  roleLevel: ROLE_LEVELS.guest,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLevel, setRoleLevel] = useState<RoleLevel>(ROLE_LEVELS.guest);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    // onIdTokenChanged fires on login, logout, and token refresh (including role changes).
    // When a new token is issued (e.g., after role promotion + getIdToken(true)),
    // this listener fires again and we can read the updated custom claims.
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // getIdTokenResult includes decodedPayload with custom claims
          const tokenResult = await getIdTokenResult(firebaseUser);
          const level = (tokenResult.claims.roleLevel as number | undefined) ?? ROLE_LEVELS.guest;
          setRoleLevel(level as RoleLevel);
        } catch {
          // On error, default to guest — safe fallback
          setRoleLevel(ROLE_LEVELS.guest);
        }
      } else {
        setRoleLevel(ROLE_LEVELS.guest);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, roleLevel }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
