import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteChrome from '../../../components/SiteChrome';
import CategoryPageClient from '../../../components/CategoryPageClient';
import { CATEGORY_SLUGS, getCategoryLabel, getCategoryPath, isCategorySlug } from '../../../lib/categories';
import { isSupportedLanguage } from '../../../lib/languages';
import { getArticleList, toArticleSummary } from '../../../lib/articleSeo';
import { getArticlePath } from '../../../lib/articleRoutes';
import { absoluteUrl } from '../../../lib/site';
import { buildAlternates, buildPageMetadata, jsonLd } from '../../../lib/seo';

type Params = { language: string; category: string };

const descriptionTemplates: Record<string, (label: string) => string> = {
  es: (label) => `Historias y curiosidades de ${label.toLowerCase()} para niños: cuentos para leer en familia, dibujos para colorear, puzles y canciones en KidZcoop.`,
  en: (label) => `${label} stories and fun facts for kids: tales to read together, coloring pages, puzzles and songs on KidZcoop.`,
  fr: (label) => `Histoires et curiosités « ${label} » pour enfants : à lire en famille, avec coloriages, puzzles et chansons sur KidZcoop.`,
  de: (label) => `${label}: Geschichten und spannende Fakten für Kinder – zum gemeinsamen Lesen, mit Ausmalbildern, Puzzles und Liedern auf KidZcoop.`,
  it: (label) => `Storie e curiosità di ${label.toLowerCase()} per bambini: da leggere in famiglia, con disegni da colorare, puzzle e canzoni su KidZcoop.`,
  pt: (label) => `Histórias e curiosidades de ${label.toLowerCase()} para crianças: para ler em família, com desenhos para colorir, puzzles e canções na KidZcoop.`,
};

const titleTemplates: Record<string, (label: string) => string> = {
  es: (label) => `${label} para niños: historias y curiosidades`,
  en: (label) => `${label} for kids: stories and fun facts`,
  fr: (label) => `${label} pour enfants : histoires et curiosités`,
  de: (label) => `${label} für Kinder: Geschichten und Fakten`,
  it: (label) => `${label} per bambini: storie e curiosità`,
  pt: (label) => `${label} para crianças: histórias e curiosidades`,
};

export function generateMetadata({ params }: { params: Params }): Metadata {
  if (!isSupportedLanguage(params.language) || !isCategorySlug(params.category)) {
    return {};
  }

  const label = getCategoryLabel(params.category, params.language);
  const title = (titleTemplates[params.language] || titleTemplates.en)(label);
  const description = (descriptionTemplates[params.language] || descriptionTemplates.en)(label);

  return buildPageMetadata({
    language: params.language,
    title,
    description,
    path: getCategoryPath(params.language, params.category),
    alternates: buildAlternates(params.language, (code) => getCategoryPath(code, params.category)),
  });
}

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((category) => ({ category }));
}

export default async function CategoryPage({ params }: { params: Params }) {
  if (!isSupportedLanguage(params.language) || !isCategorySlug(params.category)) {
    notFound();
  }

  const articles = (await getArticleList(params.language, params.category)).map(toArticleSummary);
  const label = getCategoryLabel(params.category, params.language);
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: label,
      url: absoluteUrl(getCategoryPath(params.language, params.category)),
      inLanguage: params.language,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: articles.slice(0, 30).map((article, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: absoluteUrl(getArticlePath(params.language, article.id, article.title)),
          name: article.title,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'KidZcoop', item: absoluteUrl(`/${params.language}`) },
        { '@type': 'ListItem', position: 2, name: label, item: absoluteUrl(getCategoryPath(params.language, params.category)) },
      ],
    },
  ];

  return (
    <SiteChrome language={params.language}>
      {schema.map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={jsonLd(item)} />
      ))}
      <CategoryPageClient language={params.language} category={params.category} initialArticles={articles} />
    </SiteChrome>
  );
}
