import SiteChrome from '@/components/SiteChrome';
import FavoritesPage from '@/components/FavoritesPage';
import type { Metadata } from 'next';

// Personal page: keep it out of Google.
export const metadata: Metadata = { robots: { index: false, follow: true } };
export default function Page({ params }: { params: { language: string } }) { return <SiteChrome language={params.language}><FavoritesPage language={params.language} /></SiteChrome>; }
