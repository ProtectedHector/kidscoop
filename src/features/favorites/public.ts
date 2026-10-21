/** `favorites`' client-safe entry file. */
export { default as FavoriteButton } from '@/features/favorites/components/favorite-button';
export { default as FavoritesPage } from '@/features/favorites/components/favorites-page';
export {
  clearLocalFavorites,
  FAVORITES_ACCOUNT_KEY,
  type FavoriteStory,
  normalizeFavorites,
  syncFavoritesWithAccount,
} from '@/features/favorites/model/local-favorites';
