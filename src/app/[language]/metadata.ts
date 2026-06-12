import { Metadata } from 'next';
import { AVAILABLE_LANGUAGES } from '../../lib/languages';
import { SOCIAL_IMAGE, SITE_URL, absoluteUrl } from '../../lib/site';
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
  const baseUrl = SITE_URL;
  const socialImageUrl = absoluteUrl(SOCIAL_IMAGE.path, baseUrl);
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
          url: socialImageUrl,
          width: SOCIAL_IMAGE.width,
          height: SOCIAL_IMAGE.height,
          alt: SOCIAL_IMAGE.alt,
          type: SOCIAL_IMAGE.type,
        },
      ],
      locale: language,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/${language}`,
      languages: languageAlternates,
    },
  };
}
