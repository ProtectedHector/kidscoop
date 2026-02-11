"use client";

// components/Home.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ArticleSnippet from './ArticleSnippet';
import { useTranslation } from '../hooks/useTranslation';

interface Article {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date?: string;
}

const Home: React.FC = () => {
  const params = useParams();
  const language = params.language as string || 'en';
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`/api/articles?lang=${language}`);
        if (!res.ok) {
          throw new Error('Failed to fetch articles');
        }
        const articlesData = await res.json();
        setArticles(articlesData);
      } catch (err) {
        // Silently handle the error and just show no articles
        console.log('No articles available:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    if (language) {
      fetchArticles();
    }
  }, [language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-500/20"></div>
        </div>
        <span className="ml-6 text-white/80 text-lg">{t('loading.stories')}</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 max-w-lg mx-auto border border-white/20">
          <div className="text-8xl mb-6">✨</div>
          <h3 className="text-2xl font-bold text-white mb-4">
            {t('empty.title')}
          </h3>
          <p className="text-white/70 text-lg">
            {t('empty.message')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article, index) => (
        <div key={article.id}>
          <ArticleSnippet article={article} />
        </div>
      ))}
    </div>
  );
};

export default Home;
