import { Metadata } from 'next';
import { AVAILABLE_LANGUAGES } from '../../lib/languages';

const languageNames = Object.fromEntries(
  AVAILABLE_LANGUAGES.map((language) => [language.code, language.name])
);

export async function generateMetadata({
  params,
}: {
  params: { language: string };
}): Promise<Metadata> {
  const { language } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kidscoop.com';
  const langName = languageNames[language] || language;
  const languageAlternates = Object.fromEntries(
    AVAILABLE_LANGUAGES.map((availableLanguage) => [
      availableLanguage.code,
      `${baseUrl}/${availableLanguage.code}`,
    ])
  );
  
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
      languages: languageAlternates,
    },
  };
}
