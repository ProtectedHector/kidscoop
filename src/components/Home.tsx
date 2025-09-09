"use client";

// components/Home.tsx
import { useEffect, useState } from 'react';
import ArticleSnippet from './ArticleSnippet';

interface Article {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
}

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`);
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

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading articles...</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Articles Available
          </h3>
          <p className="text-gray-500">
            Check back later for new articles and stories!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleSnippet key={article.id} article={article} />
      ))}
    </div>
  );
};

export default Home;