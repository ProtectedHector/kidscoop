"use client";

// components/ArticleSnippet.tsx
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '../hooks/useTranslation';

interface Article {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date?: string;
}

interface ArticleSnippetProps {
  article: Article;
}

const ArticleSnippet: React.FC<ArticleSnippetProps> = ({ article }) => {
  const params = useParams();
  const language = params.language as string || 'en';
  const { t } = useTranslation();
  
  // Map language codes to locale codes for date formatting
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'ar': 'ar-SA',
    'hi': 'hi-IN',
    'ru': 'ru-RU'
  };
  
  const locale = localeMap[language] || 'en-US';
  
  return (
    <Link href={`/${language}/content/${article.id}`}>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-purple-500/25 transition-all duration-500 overflow-hidden cursor-pointer group transform hover:-translate-y-2 border border-white/20 hover:border-purple-400/50">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
            <img 
              src={article.image_path} 
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-purple-500/90 backdrop-blur-sm rounded-full p-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            {article.published_date && (
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-purple-300 text-sm font-medium">
                  {new Date(article.published_date).toLocaleDateString(locale, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
            
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
              {article.title}
            </h2>
            
            <p className="text-white/70 leading-relaxed text-sm mb-4 line-clamp-3">
              {article.content_text.substring(0, 120)}...
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-purple-300 font-medium text-sm group-hover:text-purple-200 transition-colors duration-300">
                <span>{t('content.readStory')}</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-purple-400/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ArticleSnippet;