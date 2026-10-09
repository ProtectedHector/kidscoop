"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  FAVORITES_ACCOUNT_KEY,
  clearLocalFavorites,
  syncFavoritesWithAccount,
} from '@/lib/favorites';
import { trackEvent } from '@/lib/analytics';
import { CLERK_ENABLED } from '@/lib/auth';

const syncedUsers = new Set<string>();

export default function UserFavoritesSync() {
  return CLERK_ENABLED ? <ClerkUserFavoritesSync /> : null;
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

    void syncFavoritesWithAccount()
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
