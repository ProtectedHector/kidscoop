"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LanguageSelector from '@/components/layout/language-selector';
import ArticleColoringStudio from '@/features/articles/components/article-coloring-studio';
import ArticlePuzzle from '@/features/articles/components/article-puzzle';
import ArticleShare from '@/features/articles/components/article-share';
import { type AffiliateAd, AffiliateSection } from '@/features/affiliates/public';
import ArticleSnippet from '@/features/articles/components/article-snippet';
import type { StoryNeighbours } from '@/features/articles/model/story-neighbours';
import type { ArticleDetail } from '@/features/articles/model/types';
import { FavoriteButton } from '@/features/favorites/public';
import { getArticlePath } from '@/lib/article-routes';
import { getCategoryLabel } from '@/lib/categories';
import { useTranslation } from '@/hooks/use-translation';
import { trackEvent } from '@/lib/analytics';


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

type ArticlePageProps = {
  article: ArticleDetail;
  neighbours: StoryNeighbours;
  affiliateAds: AffiliateAd[];
};

/** A story page. Everything it shows comes from the server; only the audio check runs here. */
export default function ArticlePage({ article, neighbours, affiliateAds }: ArticlePageProps) {
  const params = useParams();
  const language = params.language as string;
  const { t } = useTranslation();

  const [hasAudio, setHasAudio] = useState(false);
  const [audioLanguage, setAudioLanguage] = useState<string>(language);
  const lyricsLanguage = article.lyrics?.trim() ? article.lyrics_language || language : null;
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
    trackEvent('story_view', { story_id: article.id, language });
  }, [article.id, language]);

  // Audio files are static ({id}_{language}.mp3, English as fallback); check which one exists.
  useEffect(() => {
    let cancelled = false;
    const candidates = language === 'en' ? ['en'] : [language, 'en'];

    async function findAudio() {
      for (const candidate of candidates) {
        try {
          const response = await fetch(`/articles/${article.id}_${candidate}.mp3`, { method: 'HEAD' });
          if (response.ok) {
            if (!cancelled) {
              setHasAudio(true);
              setAudioLanguage(candidate);
            }
            return;
          }
        } catch {
          // Try the next candidate.
        }
      }
      if (!cancelled) setHasAudio(false);
    }

    void findAudio();
    return () => {
      cancelled = true;
    };
  }, [article.id, language]);

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

  const { previous: previousArticle, next: nextArticle, related: relatedArticles } = neighbours;
  const navCopy = storyNavCopy[language] || storyNavCopy.en;
  const articlePath = getArticlePath(language, article.id, article.title);
  const readMinutes = Math.max(1, Math.ceil(article.content_text.trim().split(/\s+/).length / 220));
  const formattedDate = new Intl.DateTimeFormat(language, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(article.published_date));
  const intro = getIntro(article.content_text);
  const categoryLabel = getCategoryLabel(article.category, language);
  const relatedTitle = relatedCopy[language] || relatedCopy.en;

  return (
    <>
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
                  <time dateTime={article.published_date}>{formattedDate}</time>
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
