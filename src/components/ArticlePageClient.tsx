"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LanguageSelector from './LanguageSelector';
import ArticleColoringStudio from './ArticleColoringStudio';
import ArticlePuzzle from './ArticlePuzzle';
import { getArticlePath } from '../lib/articleRoutes';
import { useTranslation } from '../hooks/useTranslation';

interface Article {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date: string;
  lyrics?: string;
  lyrics_language?: string;
}

const storyNavCopy: Record<string, { previous: string; next: string }> = {
  es: { previous: 'Historia anterior', next: 'Siguiente historia' },
  en: { previous: 'Previous story', next: 'Next story' },
  fr: { previous: 'Histoire précédente', next: 'Histoire suivante' },
  de: { previous: 'Vorherige Geschichte', next: 'Nächste Geschichte' },
  it: { previous: 'Storia precedente', next: 'Storia successiva' },
  pt: { previous: 'História anterior', next: 'Próxima história' },
  zh: { previous: '上一篇故事', next: '下一篇故事' },
  ja: { previous: '前のストーリー', next: '次のストーリー' },
  ko: { previous: '이전 이야기', next: '다음 이야기' },
  ar: { previous: 'القصة السابقة', next: 'القصة التالية' },
  hi: { previous: 'पिछली कहानी', next: 'अगली कहानी' },
  ru: { previous: 'Предыдущая история', next: 'Следующая история' },
};

export default function ArticlePageClient() {
  const params = useParams();
  const language = params.language as string;
  const articleId = params.id as string;
  const { t } = useTranslation();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioLanguage, setAudioLanguage] = useState<string>(language);
  const [lyricsLanguage, setLyricsLanguage] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (!lightbox) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox]);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined';

    setSpeechSupported(supported);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const [articleResponse, articleListResponse] = await Promise.all([
          fetch(`/api/articles/${articleId}?lang=${language}`),
          fetch(`/api/articles?lang=${language}`),
        ]);

        if (!articleResponse.ok) {
          throw new Error('Failed to fetch article');
        }

        const articleData = await articleResponse.json();
        setArticle(articleData);

        if (articleListResponse.ok) {
          const articlesData = await articleListResponse.json();
          setArticleList(articlesData);
        } else {
          setArticleList([]);
        }
        
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

  // Generate structured data for SEO
  const structuredData = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.content_text.substring(0, 200),
    "image": article.image_path,
    "datePublished": article.published_date,
    "author": {
      "@type": "Organization",
      "name": "KidZcoop"
    },
    "publisher": {
      "@type": "Organization",
      "name": "KidZcoop",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png"
      }
    },
    "inLanguage": language,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": getArticlePath(language, article.id, article.title)
    }
  } : null;

  const handleToggleSpeak = () => {
    if (
      !speechSupported ||
      typeof window === 'undefined' ||
      !article ||
      !('speechSynthesis' in window)
    ) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new window.SpeechSynthesisUtterance(`${article.title}. ${article.content_text}`);
    utterance.lang = language;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith(language.toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const currentArticleIndex = articleList.findIndex((item) => String(item.id) === String(article.id));
  const previousArticle = currentArticleIndex > 0 ? articleList[currentArticleIndex - 1] : null;
  const nextArticle =
    currentArticleIndex >= 0 && currentArticleIndex < articleList.length - 1
      ? articleList[currentArticleIndex + 1]
      : null;
  const navCopy = storyNavCopy[language] || storyNavCopy.en;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating Logo */}
      <div className="fixed top-8 left-8 z-50 scroll-stable">
        <Link href={`/${language}`}>
          <div className="relative">
            <Image
              src="/logo.png"
              alt="KidZcoop Logo"
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {article.title}
            </h1>
          </div>

          {/* Article Image */}
          <div className="relative mb-8 px-12 md:px-28">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl cursor-zoom-in"
              onClick={() =>
                setLightbox({
                  src: article.image_path,
                  alt: article.title,
                })
              }
              >
              <Image
                src={article.image_path}
                alt={article.title}
                width={800}
                height={800}
                className="h-[32rem] w-full bg-slate-950/35 object-contain md:h-[40rem]"
                priority
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            {previousArticle && (
              <Link
                href={getArticlePath(language, previousArticle.id, previousArticle.title)}
                className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 rounded-full border border-white/25 bg-slate-950/65 p-3 text-white shadow-2xl backdrop-blur-md transition hover:bg-purple-700/80 md:-left-10 md:px-4 md:py-3 lg:-left-16"
                aria-label={navCopy.previous}
                title={navCopy.previous}
              >
                <svg className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden text-sm font-black lg:inline">{navCopy.previous}</span>
              </Link>
            )}
            {nextArticle && (
              <Link
                href={getArticlePath(language, nextArticle.id, nextArticle.title)}
                className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 rounded-full border border-white/25 bg-slate-950/65 p-3 text-white shadow-2xl backdrop-blur-md transition hover:bg-purple-700/80 md:-right-10 md:px-4 md:py-3 lg:-right-16"
                aria-label={navCopy.next}
                title={navCopy.next}
              >
                <span className="hidden text-sm font-black lg:inline">{navCopy.next}</span>
                <svg className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
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
          <div className="mt-5 mb-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSpeak}
              disabled={!speechSupported}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
              aria-pressed={isSpeaking}
            >
              <span>{isSpeaking ? '⏹️' : '🔊'}</span>
              <span>{isSpeaking ? t('content.stopListening') : t('content.listenArticle')}</span>
            </button>
            {!speechSupported && (
              <p className="text-white/70 text-sm">{t('content.speechNotSupported')}</p>
            )}
          </div>

          <ArticlePuzzle
            imageId={article.id}
            imageAlt={article.title}
            labels={{
              title: t('content.puzzleTitle'),
              description: t('content.puzzleDescription'),
              hint: t('content.puzzleHint'),
              solved: t('content.puzzleSolved'),
              solvedDescription: t('content.puzzleSolvedDescription'),
              shuffle: t('content.puzzleShuffle'),
              difficulty: t('content.puzzleDifficulty'),
              status: t('content.puzzleStatus'),
              moves: t('content.puzzleMoves'),
              ready: t('content.puzzleReady'),
              selected: t('content.puzzleSelected'),
            }}
          />

          <ArticleColoringStudio
            imageId={article.id}
            imageAlt={article.title}
            labels={{
              title: t('content.coloringFun'),
              description: t('content.coloringStudioDescription'),
              hint: t('content.coloringStudioHint'),
              undo: t('content.coloringUndo'),
              redo: t('content.coloringRedo'),
              reset: t('content.coloringReset'),
              downloadArtwork: t('content.coloringDownloadArtwork'),
              downloadPage: t('content.coloringDownloadPage'),
              loading: t('content.coloringLoading'),
            }}
          />

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
            </div>
          )}

          {/* Lyrics Section - Show if lyrics exist (independent of audio) */}
          {article.lyrics && article.lyrics.trim() !== '' && (
            <div className={`mt-12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20 ${hasAudio ? '' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">📝 {t('content.lyrics') || 'Lyrics'}</h2>
                {lyricsLanguage && lyricsLanguage !== language && (
                  <span className="text-white/50 text-xs italic">
                    {t('content.lyricsInLanguage') || `(${lyricsLanguage.toUpperCase()})`}
                  </span>
                )}
              </div>
              <div className="text-white/90 leading-relaxed text-sm whitespace-pre-line bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                {article.lyrics}
              </div>
            </div>
          )}

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
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-6 py-10"
          onClick={() => setLightbox(null)}
        >
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-white/10 px-4 py-2 text-white/90 hover:bg-white/20 transition"
              onClick={(event) => {
                event.stopPropagation();
                setLightbox(null);
              }}
              aria-label="Close image"
            >
              Close
            </button>
          </div>
          <div
            className="max-h-full w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={lightbox.src}
              alt={lightbox.alt}
              width={1200}
              height={1200}
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
