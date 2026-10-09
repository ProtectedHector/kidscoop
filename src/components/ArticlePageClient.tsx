"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LanguageSelector from './LanguageSelector';
import ArticleColoringStudio from './ArticleColoringStudio';
import ArticlePuzzle from './ArticlePuzzle';
import ArticleShare from './ArticleShare';
import FavoriteButton from './FavoriteButton';
import { AffiliateSection, type AffiliateAd } from './AffiliateAds';
import ArticleSnippet from './ArticleSnippet';
import { getArticlePath } from '../lib/articleRoutes';
import { getCategoryLabel } from '../lib/categories';
import { useTranslation } from '../hooks/useTranslation';
import { trackEvent } from '../lib/analytics';

interface Article {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date: string;
  lyrics?: string;
  lyrics_language?: string;
  category?: string;
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

const relatedCopy: Record<string, string> = {
  es: 'También te puede gustar',
  en: 'You may also like',
};

function getIntro(text: string) {
  const firstParagraph = text.split('\n\n').find((paragraph) => paragraph.trim().length > 0) || text;
  const sentence = firstParagraph.match(/^(.+?[.!?])\s/)?.[1] || firstParagraph;
  return sentence.trim().slice(0, 180);
}

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
  const [affiliateAds, setAffiliateAds] = useState<AffiliateAd[]>([]);
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
      setLoading(true);
      setError(null);
      setAffiliateAds([]);
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
        trackEvent('story_view', { story_id: articleData.id, language });

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

        try {
          const affiliatesResponse = await fetch(`/api/affiliates?articleId=${articleData.id}`);
          if (affiliatesResponse.ok) {
            const affiliatesData = await affiliatesResponse.json();
            setAffiliateAds(Array.isArray(affiliatesData) ? affiliatesData.slice(0, 3) : []);
          } else {
            setAffiliateAds([]);
          }
        } catch {
          setAffiliateAds([]);
        }
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
  const articlePath = getArticlePath(language, article.id, article.title);
  const readMinutes = Math.max(1, Math.ceil(article.content_text.trim().split(/\s+/).length / 220));
  const formattedDate = new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(new Date(article.published_date));
  const intro = getIntro(article.content_text);
  const relatedArticles = articleList
    .filter((item) => String(item.id) !== String(article.id))
    .sort((a, b) => {
      const aSameCategory = a.category && article.category && a.category === article.category ? 1 : 0;
      const bSameCategory = b.category && article.category && b.category === article.category ? 1 : 0;
      return bSameCategory - aSameCategory;
    })
    .slice(0, 4);
  const categoryLabel = getCategoryLabel(article.category, language);
  const relatedTitle = relatedCopy[language] || relatedCopy.en;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="min-h-screen bg-[#fbf9ff] pb-24 text-slate-950">
        <header className="sticky top-0 z-40 border-b border-purple-100/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href={`/${language}`} className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600">
              <Image src="/social-logo.png" alt="KidZcoop" width={44} height={44} className="h-11 w-11 rounded-xl object-contain" priority />
              <span className="text-xl font-black tracking-tight text-[#581c87]">KidZcoop</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <Link href={`/${language}`} className="inline-flex min-h-10 items-center rounded-full border border-purple-100 bg-white px-4 text-sm font-black text-[#581c87] shadow-sm hover:bg-purple-50">
                {t('content.backToStories')}
              </Link>
            </div>
          </div>
        </header>

        <main>
          <article>
            <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-10">
              <div
                className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-[2rem] bg-purple-50 shadow-xl shadow-purple-950/10 sm:aspect-[16/9]"
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
                  fill
                  sizes="(min-width: 1280px) 1180px, calc(100vw - 2rem)"
                  className="object-cover"
                  priority
                  loading="eager"
                />
              </div>

              <div className="mx-auto mt-8 max-w-3xl text-center">
                <p className="text-sm font-black uppercase tracking-[.18em] text-[#581c87]">✨ {categoryLabel}</p>
                <h1 className="mt-3 text-balance text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
                  {article.title}
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  {intro}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-500">
                  <span>{categoryLabel}</span>
                  <span aria-hidden="true" className="text-purple-300">·</span>
                  <span>{readMinutes} min</span>
                  <span aria-hidden="true" className="text-purple-300">·</span>
                  <time>{formattedDate}</time>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <ArticleShare key={`${language}-${article.id}`} language={language} title={article.title} path={articlePath} />
                  <FavoriteButton story={{ id: article.id, title: article.title, image_path: article.image_path, language, path: articlePath }} />
                </div>
              </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
              <div className="min-w-0">
                <div className="mx-auto max-w-3xl rounded-[2rem] border border-purple-100 bg-white p-6 shadow-sm sm:p-9">
                  <div className="space-y-7 text-[1.08rem] leading-8 text-slate-800 sm:text-xl sm:leading-10">
                    {article.content_text.split('\n\n').map((paragraph, index) => (
                      <p key={index}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mx-auto mt-6 flex max-w-3xl flex-col items-start gap-3 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-3">
                    <ArticleShare language={language} title={article.title} path={articlePath} />
                    <FavoriteButton story={{ id: article.id, title: article.title, image_path: article.image_path, language, path: articlePath }} />
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSpeak}
                    disabled={!speechSupported}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#581c87] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-purple-950 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-pressed={isSpeaking}
                  >
                    <span>{isSpeaking ? '⏹️' : '🔊'}</span>
                    <span>{isSpeaking ? t('content.stopListening') : t('content.listenArticle')}</span>
                  </button>
                </div>
                {!speechSupported && (
                  <p className="mx-auto mt-2 max-w-3xl text-sm text-slate-500">{t('content.speechNotSupported')}</p>
                )}

                <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] bg-gradient-to-br from-purple-950 to-[#581c87] p-4 shadow-xl shadow-purple-950/15 sm:p-6">
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
                </div>

                <div className="mx-auto mt-8 max-w-3xl rounded-[2rem] bg-gradient-to-br from-purple-950 to-[#581c87] p-4 shadow-xl shadow-purple-950/15 sm:p-6">
                  <AffiliateSection ads={affiliateAds} language={language} tone="dark" layout="carousel" />
                </div>

                <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] bg-gradient-to-br from-purple-950 to-[#581c87] p-4 shadow-xl shadow-purple-950/15 sm:p-6">
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
                </div>

                {hasAudio && (
                  <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-purple-100 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-5">
                      <h2 className="text-2xl font-black text-slate-950">🎵 {t('content.storySong')}</h2>
                      <p className="mt-2 text-slate-600">{t('content.storySongDescription')}</p>
                    </div>
                    <audio controls className="h-12 w-full rounded-xl">
                      <source src={`/articles/${article.id}_${audioLanguage}.mp3`} type="audio/mpeg" />
                      {t('content.audioNotSupported')}
                    </audio>
                    <p className="mt-3 text-center text-sm text-slate-500">
                      🎶 {article.title} - Musical Version
                      {audioLanguage !== language && (
                        <span className="ml-2 text-xs italic text-slate-400">
                          ({t('content.lyricsInLanguage') || `(${audioLanguage.toUpperCase()})`})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {article.lyrics && article.lyrics.trim() !== '' && (
                  <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-purple-100 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="text-2xl font-black text-slate-950">📝 {t('content.lyrics') || 'Lyrics'}</h2>
                      {lyricsLanguage && lyricsLanguage !== language && (
                        <span className="text-xs italic text-slate-400">
                          {t('content.lyricsInLanguage') || `(${lyricsLanguage.toUpperCase()})`}
                        </span>
                      )}
                    </div>
                    <div className="whitespace-pre-line rounded-2xl bg-purple-50 p-5 text-sm leading-7 text-slate-700">
                      {article.lyrics}
                    </div>
                  </div>
                )}
              </div>

              <aside className="hidden lg:block lg:sticky lg:top-24">
                <div className="rounded-[2rem] border border-purple-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#581c87]">{categoryLabel}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{intro}</p>
                  <div className="mt-5 flex flex-col gap-3">
                    {previousArticle && (
                      <Link href={getArticlePath(language, previousArticle.id, previousArticle.title)} className="rounded-2xl bg-purple-50 px-4 py-3 text-sm font-black text-[#581c87] hover:bg-purple-100">
                        ← {navCopy.previous}
                      </Link>
                    )}
                    {nextArticle && (
                      <Link href={getArticlePath(language, nextArticle.id, nextArticle.title)} className="rounded-2xl bg-purple-50 px-4 py-3 text-sm font-black text-[#581c87] hover:bg-purple-100">
                        {navCopy.next} →
                      </Link>
                    )}
                  </div>
                </div>
              </aside>
            </section>

            {relatedArticles.length > 0 && (
              <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[.18em] text-[#581c87]">KidZcoop</p>
                    <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{relatedTitle}</h2>
                  </div>
                  <Link href={`/${language}#stories`} className="hidden rounded-full border border-purple-100 bg-white px-5 py-2.5 text-sm font-black text-[#581c87] shadow-sm hover:bg-purple-50 sm:inline-flex">
                    {t('content.readMoreStories')}
                  </Link>
                </div>
                <div className="mt-6 flex snap-x gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
                  {relatedArticles.map((related) => (
                    <div key={related.id} className="min-w-[18rem] snap-start sm:min-w-0">
                      <ArticleSnippet article={related} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-12 text-center">
              <Link
                href={`/${language}`}
                className="inline-flex min-h-12 items-center rounded-full bg-[#581c87] px-7 py-3 font-black text-white shadow-sm hover:bg-purple-950"
              >
                {t('content.readMoreStories')}
              </Link>
            </div>
          </article>
        </main>
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
