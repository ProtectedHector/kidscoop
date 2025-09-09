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
        const res = await fetch(`http://localhost:3001/api/articles`);
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
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-500/20"></div>
        </div>
        <span className="ml-6 text-white/80 text-lg">Loading amazing stories...</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 max-w-lg mx-auto border border-white/20">
          <div className="text-8xl mb-6">✨</div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Stories Coming Soon
          </h3>
          <p className="text-white/70 text-lg">
            We're crafting amazing adventures just for you. Check back soon for incredible stories!
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