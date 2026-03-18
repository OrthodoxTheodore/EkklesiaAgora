'use client';

import React, { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ROLE_LEVELS, ROLE_NAMES } from '@/lib/firebase/roles';
import type { RoleLevel } from '@/lib/firebase/roles';
import { promoteUser, searchUsers } from '@/app/(main)/admin/actions';

interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  roleLevel: RoleLevel;
}

interface UserRoleManagerProps {
  /** The role level of the currently logged-in admin/super-admin performing actions. */
  callerRoleLevel: number;
}

/** Returns a display-friendly role name. */
function roleBadgeLabel(level: RoleLevel): string {
  const name = ROLE_NAMES[level] ?? 'unknown';
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

/** Color class for role badge. */
function roleBadgeClass(level: RoleLevel): string {
  switch (level) {
    case ROLE_LEVELS.superAdmin:
      return 'bg-gold text-navy';
    case ROLE_LEVELS.admin:
      return 'bg-gold-dim/70 text-navy';
    case ROLE_LEVELS.moderator:
      return 'bg-navy-light border border-gold/40 text-gold';
    case ROLE_LEVELS.registered:
      return 'bg-navy-light border border-text-mid/30 text-text-mid';
    default:
      return 'bg-navy-light border border-text-mid/20 text-text-mid/60';
  }
}

/**
 * UserRoleManager — Admin panel component for searching users and managing their roles.
 *
 * Permission model (mirrors actions.ts):
 *   - Super admin (4): can assign any role
 *   - Admin (3): can assign registered (1) or moderator (2) only
 */
export function UserRoleManager({ callerRoleLevel }: UserRoleManagerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserRecord[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();

  // Per-user state maps for pending role selection and promotion status
  const [pendingRoles, setPendingRoles] = useState<Record<string, RoleLevel>>({});
  const [promotionStatus, setPromotionStatus] = useState<Record<string, string>>({});
  const [isPromoting, startPromotion] = useTransition();

  const isSuperAdmin = callerRoleLevel >= ROLE_LEVELS.superAdmin;

  /** Available role options for the dropdown, filtered by caller's permissions. */
  function availableRoles(): Array<{ value: RoleLevel; label: string }> {
    const all: Array<{ value: RoleLevel; label: string }> = [
      { value: ROLE_LEVELS.registered, label: 'Registered' },
      { value: ROLE_LEVELS.moderator, label: 'Moderator' },
      { value: ROLE_LEVELS.admin, label: 'Admin' },
      { value: ROLE_LEVELS.superAdmin, label: 'Super Admin' },
    ];
    if (isSuperAdmin) return all;
    // Admin can only assign up to moderator
    return all.filter((r) => r.value <= ROLE_LEVELS.moderator);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchError(null);
    setResults([]);

    startSearch(async () => {
      const response = await searchUsers(query.trim());
      if ('error' in response) {
        setSearchError(response.error);
      } else {
        setResults(response.results);
        if (response.results.length === 0) {
          setSearchError('No users found matching that email prefix.');
        }
      }
    });
  }

  function handlePromote(targetUid: string) {
    const newRole = pendingRoles[targetUid];
    if (newRole === undefined) return;

    setPromotionStatus((prev) => ({ ...prev, [targetUid]: 'pending' }));

    startPromotion(async () => {
      const response = await promoteUser({ targetUid, newRole });
      if ('error' in response) {
        setPromotionStatus((prev) => ({ ...prev, [targetUid]: `Error: ${response.error}` }));
      } else {
        setPromotionStatus((prev) => ({
          ...prev,
          [targetUid]: 'success',
        }));
        // Update the displayed role in results list
        setResults((prev) =>
          prev.map((u) => (u.uid === targetUid ? { ...u, roleLevel: newRole } : u)),
        );
      }
    });
  }

  const roles = availableRoles();

  return (
    <div className="space-y-8">
      {/* ── User Search ─────────────────────────────────────────────────── */}
      <Card>
        <h2 className="font-cinzel text-text-light text-sm uppercase tracking-widest mb-6">
          Search Users by Email
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              id="user-search"
              label="Email Prefix"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. john@"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            variant="gold"
            size="md"
            loading={isSearching}
            disabled={!query.trim()}
          >
            Search
          </Button>
        </form>

        {searchError && (
          <p className="mt-4 font-garamond text-sm text-gold-dim italic">{searchError}</p>
        )}
      </Card>

      {/* ── Search Results & Role Promotion ─────────────────────────────── */}
      {results.length > 0 && (
        <Card>
          <h2 className="font-cinzel text-text-light text-sm uppercase tracking-widest mb-6">
            Results ({results.length})
          </h2>

          <div className="space-y-0">
            {results.map((user, idx) => {
              const status = promotionStatus[user.uid];
              const selected = pendingRoles[user.uid];

              return (
                <div
                  key={user.uid}
                  className={`py-5 ${idx < results.length - 1 ? 'border-b border-gold-dim/20' : ''}`}
                >
                  {/* User info row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <p className="font-cinzel text-text-light text-sm truncate">
                        {user.displayName || user.email}
                      </p>
                      {user.displayName && (
                        <p className="font-garamond text-text-mid text-sm truncate mt-0.5">
                          {user.email}
                        </p>
                      )}
                      <p className="font-garamond text-text-mid/50 text-xs mt-0.5 font-mono">
                        uid: {user.uid}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-cinzel uppercase tracking-wider ${roleBadgeClass(user.roleLevel)}`}
                    >
                      {roleBadgeLabel(user.roleLevel)}
                    </span>
                  </div>

                  {/* Role promotion controls */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={selected ?? ''}
                      onChange={(e) =>
                        setPendingRoles((prev) => ({
                          ...prev,
                          [user.uid]: Number(e.target.value) as RoleLevel,
                        }))
                      }
                      aria-label={`New role for ${user.email}`}
                      className="bg-navy-light border border-gold-dim/50 rounded-md px-3 py-2 font-garamond text-text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold-dim/60 focus:border-gold-dim"
                    >
                      <option value="" disabled>
                        Assign role...
                      </option>
                      {roles.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handlePromote(user.uid)}
                      disabled={selected === undefined || isPromoting}
                      loading={status === 'pending'}
                    >
                      Promote
                    </Button>

                    {/* Status feedback */}
                    {status && status !== 'pending' && (
                      <p
                        className={`font-garamond text-sm italic ${
                          status === 'success' ? 'text-gold' : 'text-crimson'
                        }`}
                      >
                        {status === 'success'
                          ? 'Role updated. User must refresh their session for the new role to take effect.'
                          : status}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
