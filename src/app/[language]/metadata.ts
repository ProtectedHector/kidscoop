import { Metadata } from 'next';
import { AVAILABLE_LANGUAGES } from '../../lib/languages';
import { getMetadataTranslations } from '../../translations/metadata';

const languageNames = Object.fromEntries(
  AVAILABLE_LANGUAGES.map((language) => [language.code, language.name])
);

export async function generateMetadata({
  params,
}: {
  params: { language: string };
}): Promise<Metadata> {
  const { language } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kidscoop.vercel.app';
  const langName = languageNames[language] || language;
  const metadataTranslations = getMetadataTranslations(language as Parameters<typeof getMetadataTranslations>[0]);
  const title = metadataTranslations.title;
  const description = metadataTranslations.description;
  const languageAlternates = Object.fromEntries(
    AVAILABLE_LANGUAGES.map((availableLanguage) => [
      availableLanguage.code,
      `${baseUrl}/${availableLanguage.code}`,
    ])
  );
  
  return {
    title: `${title} (${langName})`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${language}`,
      siteName: 'KidScoop',
      images: [
        {
          url: `${baseUrl}/logo.png`,
          width: 1019,
          height: 573,
          alt: 'KidScoop',
        },
      ],
      locale: language,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/logo.png`],
    },
    alternates: {
      canonical: `${baseUrl}/${language}`,
      languages: languageAlternates,
    },
  };
}
