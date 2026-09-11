"use client";

// components/Home.tsx
import { useEffect, useMemo, useState } from 'react';
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

const ARTICLES_PER_PAGE = 6;

const paginationCopy: Record<string, {
  previous: string;
  next: string;
  page: string;
  showing: (start: number, end: number, total: number) => string;
}> = {
  es: {
    previous: 'Anterior',
    next: 'Siguiente',
    page: 'Página',
    showing: (start, end, total) => `${start}-${end} de ${total} historias`,
  },
  en: {
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    showing: (start, end, total) => `${start}-${end} of ${total} stories`,
  },
  fr: {
    previous: 'Précédent',
    next: 'Suivant',
    page: 'Page',
    showing: (start, end, total) => `${start}-${end} sur ${total} histoires`,
  },
  de: {
    previous: 'Zurück',
    next: 'Weiter',
    page: 'Seite',
    showing: (start, end, total) => `${start}-${end} von ${total} Geschichten`,
  },
  it: {
    previous: 'Indietro',
    next: 'Avanti',
    page: 'Pagina',
    showing: (start, end, total) => `${start}-${end} di ${total} storie`,
  },
  pt: {
    previous: 'Anterior',
    next: 'Seguinte',
    page: 'Página',
    showing: (start, end, total) => `${start}-${end} de ${total} histórias`,
  },
  zh: {
    previous: '上一页',
    next: '下一页',
    page: '第',
    showing: (start, end, total) => `${start}-${end} / ${total} 个故事`,
  },
  ja: {
    previous: '前へ',
    next: '次へ',
    page: 'ページ',
    showing: (start, end, total) => `${total}話中 ${start}-${end}`,
  },
  ko: {
    previous: '이전',
    next: '다음',
    page: '페이지',
    showing: (start, end, total) => `${total}개 이야기 중 ${start}-${end}`,
  },
  ar: {
    previous: 'السابق',
    next: 'التالي',
    page: 'صفحة',
    showing: (start, end, total) => `${start}-${end} من ${total} قصة`,
  },
  hi: {
    previous: 'पिछला',
    next: 'अगला',
    page: 'पेज',
    showing: (start, end, total) => `${total} कहानियों में से ${start}-${end}`,
  },
  ru: {
    previous: 'Назад',
    next: 'Далее',
    page: 'Страница',
    showing: (start, end, total) => `${start}-${end} из ${total} историй`,
  },
};

const Home: React.FC = () => {
  const params = useParams();
  const language = params.language as string || 'en';
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const copy = paginationCopy[language] || paginationCopy.en;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles?lang=${language}`);
        if (!res.ok) {
          throw new Error('Failed to fetch articles');
        }
        const articlesData = await res.json();
        setArticles(articlesData);
        setCurrentPage(1);
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

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const pageStartIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const visibleArticles = useMemo(
    () => articles.slice(pageStartIndex, pageStartIndex + ARTICLES_PER_PAGE),
    [articles, pageStartIndex]
  );
  const showingStart = articles.length === 0 ? 0 : pageStartIndex + 1;
  const showingEnd = Math.min(pageStartIndex + ARTICLES_PER_PAGE, articles.length);
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  function goToPage(page: number) {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    window.requestAnimationFrame(() => {
      document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

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
    <div className="space-y-6" id="stories">
      {visibleArticles.map((article) => (
        <div key={article.id}>
          <ArticleSnippet article={article} />
        </div>
      ))}

      {totalPages > 1 && (
        <nav className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-md sm:flex-row sm:px-5" aria-label="Stories pagination">
          <p className="text-sm font-semibold text-white/70">
            {copy.showing(showingStart, showingEnd, articles.length)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.previous}
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`${copy.page} ${page}`}
                className={`h-10 w-10 rounded-full text-sm font-black transition ${
                  page === currentPage
                    ? 'bg-yellow-300 text-slate-950'
                    : 'border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.next}
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Home;
