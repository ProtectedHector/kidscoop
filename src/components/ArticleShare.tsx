"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { isSupportedLanguage, type Language } from '../lib/languages';

type ShareCopy = {
  share: string;
  email: string;
  copy: string;
  copied: string;
  manualCopy: string;
  more: string;
  unavailable: string;
  link: string;
};

const translations: Record<Language, ShareCopy> = {
  en: { share: 'Share story', email: 'Email', copy: 'Copy link', copied: 'Link copied!', manualCopy: 'Select and copy the link below.', more: 'More apps', unavailable: 'Choose an option below to share this story.', link: 'Story link' },
  es: { share: 'Compartir historia', email: 'Correo', copy: 'Copiar enlace', copied: '¡Enlace copiado!', manualCopy: 'Selecciona y copia el enlace de abajo.', more: 'Más aplicaciones', unavailable: 'Elige una opción de abajo para compartir esta historia.', link: 'Enlace de la historia' },
  fr: { share: 'Partager l’histoire', email: 'E-mail', copy: 'Copier le lien', copied: 'Lien copié !', manualCopy: 'Sélectionnez et copiez le lien ci-dessous.', more: 'Autres applications', unavailable: 'Choisissez une option ci-dessous pour partager cette histoire.', link: 'Lien de l’histoire' },
  de: { share: 'Geschichte teilen', email: 'E-Mail', copy: 'Link kopieren', copied: 'Link kopiert!', manualCopy: 'Wähle den Link unten aus und kopiere ihn.', more: 'Weitere Apps', unavailable: 'Wähle unten eine Option zum Teilen dieser Geschichte.', link: 'Link zur Geschichte' },
  it: { share: 'Condividi la storia', email: 'E-mail', copy: 'Copia link', copied: 'Link copiato!', manualCopy: 'Seleziona e copia il link qui sotto.', more: 'Altre app', unavailable: 'Scegli un’opzione qui sotto per condividere questa storia.', link: 'Link della storia' },
  pt: { share: 'Partilhar história', email: 'E-mail', copy: 'Copiar ligação', copied: 'Ligação copiada!', manualCopy: 'Seleciona e copia a ligação abaixo.', more: 'Mais aplicações', unavailable: 'Escolhe uma opção abaixo para partilhar esta história.', link: 'Ligação da história' },
  zh: { share: '分享故事', email: '电子邮件', copy: '复制链接', copied: '链接已复制！', manualCopy: '请选择并复制下方链接。', more: '更多应用', unavailable: '请选择下方选项来分享这个故事。', link: '故事链接' },
  ja: { share: 'ストーリーを共有', email: 'メール', copy: 'リンクをコピー', copied: 'リンクをコピーしました！', manualCopy: '下のリンクを選択してコピーしてください。', more: 'その他のアプリ', unavailable: '下のオプションからストーリーを共有してください。', link: 'ストーリーのリンク' },
  ko: { share: '이야기 공유', email: '이메일', copy: '링크 복사', copied: '링크가 복사되었습니다!', manualCopy: '아래 링크를 선택하여 복사하세요.', more: '다른 앱', unavailable: '아래 옵션을 선택하여 이야기를 공유하세요.', link: '이야기 링크' },
  ar: { share: 'مشاركة القصة', email: 'البريد الإلكتروني', copy: 'نسخ الرابط', copied: 'تم نسخ الرابط!', manualCopy: 'حدد الرابط أدناه وانسخه.', more: 'تطبيقات أخرى', unavailable: 'اختر أحد الخيارات أدناه لمشاركة هذه القصة.', link: 'رابط القصة' },
  hi: { share: 'कहानी साझा करें', email: 'ईमेल', copy: 'लिंक कॉपी करें', copied: 'लिंक कॉपी हो गया!', manualCopy: 'नीचे दिए गए लिंक को चुनें और कॉपी करें।', more: 'अन्य ऐप', unavailable: 'कहानी साझा करने के लिए नीचे कोई विकल्प चुनें।', link: 'कहानी का लिंक' },
  ru: { share: 'Поделиться историей', email: 'Эл. почта', copy: 'Копировать ссылку', copied: 'Ссылка скопирована!', manualCopy: 'Выделите и скопируйте ссылку ниже.', more: 'Другие приложения', unavailable: 'Выберите вариант ниже, чтобы поделиться историей.', link: 'Ссылка на историю' },
};

function ShareIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
    </svg>
  );
}

export default function ArticleShare({ language, title, path }: { language: string; title: string; path: string }) {
  const copy = translations[isSupportedLanguage(language) ? language : 'en'];
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [nativeSupported, setNativeSupported] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstOptionRef = useRef<HTMLAnchorElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    firstOptionRef.current?.focus();
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const toggle = () => {
    // Use the localized article route, excluding tracking parameters and fragments.
    const articleUrl = new URL(path, window.location.origin).href;
    setUrl(articleUrl);
    setNativeSupported(typeof navigator.share === 'function' &&
      (typeof navigator.canShare !== 'function' || navigator.canShare({ title, url: articleUrl })));
    setStatus('');
    setOpen(!open);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus(copy.copied);
    } catch {
      setStatus(copy.manualCopy);
      linkRef.current?.focus();
      linkRef.current?.select();
    }
  };

  const shareWithDevice = async () => {
    setSharing(true);
    setStatus('');
    try {
      await navigator.share({ title, url });
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        setStatus(copy.unavailable);
      }
    } finally {
      setSharing(false);
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const options = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}` },
    { label: copy.email, href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}`)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}` },
  ];
  const optionClass = 'flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition hover:bg-purple-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300';

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-fit max-w-full"
      dir={language === 'ar' ? 'rtl' : undefined}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
      >
        <ShareIcon />
        {copy.share}
      </button>
      {open && (
        <div id={panelId} role="region" aria-label={copy.share} className="absolute left-1/2 top-full z-30 mt-3 w-80 max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-2xl border border-white/20 bg-slate-900 p-4 text-start shadow-2xl">
          <div className="grid grid-cols-2 gap-2">
            {options.map((option, index) => (
              <a
                key={option.label}
                ref={index === 0 ? firstOptionRef : undefined}
                href={option.href}
                target={option.href.startsWith('https:') ? '_blank' : undefined}
                rel={option.href.startsWith('https:') ? 'noopener noreferrer' : undefined}
                className={optionClass}
              >
                {option.label}
              </a>
            ))}
            <button type="button" onClick={copyLink} className={optionClass}>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8V4H4v12h4" />
              </svg>
              {copy.copy}
            </button>
            {nativeSupported && (
              <button type="button" onClick={shareWithDevice} disabled={sharing} className={`${optionClass} disabled:opacity-50`}>
                <ShareIcon />
                {copy.more}
              </button>
            )}
          </div>
          <label className="mt-4 block text-xs text-white/70">
            {copy.link}
            <input ref={linkRef} type="text" readOnly value={url} dir="ltr" onFocus={(event) => event.currentTarget.select()} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300" />
          </label>
          <p role="status" aria-live="polite" className="mt-2 text-sm text-purple-200">{status}</p>
        </div>
      )}
    </div>
  );
}
