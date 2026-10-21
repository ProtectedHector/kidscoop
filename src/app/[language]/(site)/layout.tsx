import SiteChrome from '@/components/layout/site-chrome';
import { AuthControls } from '@/features/auth/public';

/** Public pages share the site header, footer and mobile nav. Story pages have their own header. */
export default async function SiteLayout(props: { children: React.ReactNode; params: Promise<{ language: string }> }) {
  const { language } = await props.params;
  return (
    <SiteChrome language={language} account={<AuthControls language={language} />}>
      {props.children}
    </SiteChrome>
  );
}
