import { FavoritesPage } from '@/features/favorites/public';
import type { Metadata } from 'next';

// Personal page: keep it out of Google.
export const metadata: Metadata = { robots: { index: false, follow: true } };
export default async function Page(props: { params: Promise<{ language: string }> }) {
  const params = await props.params;
  return <><FavoritesPage language={params.language} /></>;
}
