"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  FAVORITES_ACCOUNT_KEY,
  clearLocalFavorites,
  syncFavoritesWithAccount,
} from '@/features/favorites/public';
import { showLoginProblem } from '@/features/auth/model/login-problems';
import { trackEvent } from '@/lib/analytics';
import { clerkEnabled } from '@/lib/env.client';

const syncedUsers = new Set<string>();

/** After sign-in: saves the user in Convex and merges this device's favorites into the account. */
export default function AccountSync() {
  return clerkEnabled ? <ClerkUserFavoritesSync /> : null;
}

function ClerkUserFavoritesSync() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const previousUser = localStorage.getItem(FAVORITES_ACCOUNT_KEY);

    if (!isSignedIn || !user) {
      if (previousUser) {
        localStorage.removeItem(FAVORITES_ACCOUNT_KEY);
        clearLocalFavorites();
        trackEvent('logout');
      }
      return;
    }

    if (!previousUser) {
      trackEvent('login_completed');
    }

    localStorage.setItem(FAVORITES_ACCOUNT_KEY, user.id);

    if (syncedUsers.has(user.id)) return;
    syncedUsers.add(user.id);

    void fetch('/api/users/sync', { method: 'POST' })
      .then((response) => {
        // The server has already reported the failure; here we only tell the visitor.
        if (!response.ok && response.status !== 401) showLoginProblem('sync_failed');
      })
      .catch(() => null)
      .then(() => syncFavoritesWithAccount())
      .then((favorites) => {
        if (favorites) {
          trackEvent('favorites_synced', { count: favorites.length });
        } else {
          syncedUsers.delete(user.id);
        }
      })
      .catch(() => syncedUsers.delete(user.id));
  }, [isLoaded, isSignedIn, user]);

  return null;
}
