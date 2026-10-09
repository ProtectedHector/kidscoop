import SiteChrome from '@/components/SiteChrome';
import FavoritesPage from '@/components/FavoritesPage';
export default function Page({ params }: { params: { language: string } }) { return <SiteChrome language={params.language}><FavoritesPage language={params.language} /></SiteChrome>; }
