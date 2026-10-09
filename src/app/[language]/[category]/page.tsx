import { notFound } from 'next/navigation';
import CategoryPageClient from '../../../components/CategoryPageClient';
import { isCategorySlug } from '../../../lib/categories';
import { isSupportedLanguage } from '../../../lib/languages';

export default function CategoryPage({ params }: { params: { language: string; category: string } }) {
  if (!isSupportedLanguage(params.language) || !isCategorySlug(params.category)) {
    notFound();
  }

  return <CategoryPageClient language={params.language} category={params.category} />;
}
