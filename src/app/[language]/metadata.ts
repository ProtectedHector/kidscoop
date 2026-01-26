import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { language: string };
}): Promise<Metadata> {
  const { language } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kidscoop.com';
  
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
  };
  
  const langName = languageNames[language] || language;
  
  return {
    title: `KidScoop - Amazing Stories for Kids (${langName})`,
    description: 'Where curiosity meets discovery. Dive into a world of amazing stories, fascinating facts, and endless adventures designed just for young minds.',
    openGraph: {
      title: `KidScoop - Amazing Stories for Kids`,
      description: 'Where curiosity meets discovery. Dive into a world of amazing stories, fascinating facts, and endless adventures designed just for young minds.',
      images: ['/logo.png'],
      locale: language,
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/${language}`,
      languages: {
        'en': `${baseUrl}/en`,
        'es': `${baseUrl}/es`,
        'fr': `${baseUrl}/fr`,
        'de': `${baseUrl}/de`,
        'it': `${baseUrl}/it`,
        'pt': `${baseUrl}/pt`,
      },
    },
  };
}
