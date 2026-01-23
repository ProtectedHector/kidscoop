"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LanguageSelector from '../../../../components/LanguageSelector';
import { useTranslation } from '../../../../hooks/useTranslation';

interface Article {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date: string;
  lyrics?: string;
  lyrics_language?: string;
}

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const language = params.language as string;
  const articleId = params.id as string;
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
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioLanguage, setAudioLanguage] = useState<string>(language);
  const [lyricsLanguage, setLyricsLanguage] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/articles/${articleId}?lang=${language}`);
        if (!res.ok) {
          throw new Error('Failed to fetch article');
        }
        const articleData = await res.json();
        setArticle(articleData);
        
        // Track lyrics language (current language or 'en' if fallback)
        if (articleData.lyrics_language) {
          setLyricsLanguage(articleData.lyrics_language);
        } else if (articleData.lyrics && articleData.lyrics.trim() !== '') {
          setLyricsLanguage(language);
        } else {
          setLyricsLanguage(null);
        }
        
        // Check if audio file exists with new format: {id}_{language}.mp3
        // If not found, try English version as fallback
        const checkAudio = async () => {
          try {
            // First try current language
            const audioResponse = await fetch(`/articles/${articleData.id}_${language}.mp3`, { method: 'HEAD' });
            if (audioResponse.ok) {
              setHasAudio(true);
              setAudioLanguage(language);
              return;
            }
            
            // If not found and not English, try English version
            if (language !== 'en') {
              const enAudioResponse = await fetch(`/articles/${articleData.id}_en.mp3`, { method: 'HEAD' });
              if (enAudioResponse.ok) {
                setHasAudio(true);
                setAudioLanguage('en');
                return;
              }
            }
            
            // No audio found
            setHasAudio(false);
          } catch {
            setHasAudio(false);
          }
        };
        
        checkAudio();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (articleId && language) {
      fetchArticle();
    }
  }, [articleId, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-500/20"></div>
        </div>
        <span className="ml-6 text-white/80 text-lg">{t('loading.story')}</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('content.storyNotFound')}</h2>
          <p className="text-white/70 mb-6">{t('content.storyNotFoundMessage')}</p>
          <Link 
            href={`/${language}`}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
          >
            {t('content.backToStories')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating Logo */}
      <div className="fixed top-8 left-8 z-50">
        <Link href={`/${language}`}>
          <div className="relative">
            <Image
              src="/logo.png"
              alt="KidScoop Logo"
              width={60}
              height={60}
              className="rounded-full shadow-2xl hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
          </div>
        </Link>
      </div>

      {/* Back Button and Language Selector */}
      <div className="fixed top-8 right-8 z-50 flex items-center space-x-4">
        <LanguageSelector />
        <Link href={`/${language}`}>
          <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center text-white/80 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('content.backToStories')}
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Article Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
              <span className="text-purple-300 text-sm font-medium">
                {new Date(article.published_date).toLocaleDateString(locale, { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {article.title}
            </h1>
          </div>

          {/* Article Image */}
          <div className="mb-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={article.image_path}
                alt={article.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="prose prose-invert max-w-none">
              <div className="text-white/90 leading-relaxed text-lg space-y-6">
                {article.content_text.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Section - Only show if audio file exists */}
          {hasAudio && (
            <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🎵 {t('content.storySong')}</h2>
                <p className="text-white/70">{t('content.storySongDescription')}</p>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 w-full max-w-md">
                  <audio 
                    controls 
                    className="w-full h-12 bg-white/10 rounded-lg"
                    style={{
                      filter: 'invert(1) hue-rotate(180deg)',
                    }}
                  >
                    <source src={`/articles/${article.id}_${audioLanguage}.mp3`} type="audio/mpeg" />
                    {t('content.audioNotSupported')}
                  </audio>
                  <div className="mt-4 text-center">
                    <p className="text-white/60 text-sm">
                      🎶 {article.title} - Musical Version
                      {audioLanguage !== language && (
                        <span className="ml-2 text-white/40 text-xs italic">
                          ({t('content.lyricsInLanguage') || `(${audioLanguage.toUpperCase()})`})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Lyrics Section - Show if lyrics exist */}
              {article.lyrics && article.lyrics.trim() !== '' && (
                <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">📝 {t('content.lyrics') || 'Lyrics'}</h3>
                    {lyricsLanguage && lyricsLanguage !== language && (
                      <span className="text-white/50 text-xs italic">
                        {t('content.lyricsInLanguage') || `(${lyricsLanguage.toUpperCase()})`}
                      </span>
                    )}
                  </div>
                  <div className="text-white/90 leading-relaxed text-sm whitespace-pre-line">
                    {article.lyrics}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coloring Section */}
          <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🎨 {t('content.coloringFun')}</h2>
                <p className="text-white/70">{t('content.coloringDescription')}</p>
              </div>
            
            <div className="flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => {
                const link = document.createElement('a');
                link.href = `/articles/${article.id}c.png`;
                link.download = `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_coloring_page.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}>
                <Image
                  src={`/articles/${article.id}c.png`}
                  alt={`Coloring page for ${article.title}`}
                  width={400}
                  height={400}
                  className="rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-purple-500/90 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white text-sm font-medium">{t('content.clickToDownload')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <Link 
              href={`/${language}`}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
            >
              {t('content.readMoreStories')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
