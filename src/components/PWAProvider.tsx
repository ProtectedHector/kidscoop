"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { trackEvent } from '../lib/analytics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type PWAState = {
  installed: boolean;
  isIOS: boolean;
  isSafari: boolean;
  canPrompt: boolean;
  install: () => Promise<'accepted' | 'dismissed' | 'ios' | 'unavailable'>;
};

const PWAContext = createContext<PWAState | null>(null);

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [online, setOnline] = useState(true);
  const [updateReady, setUpdateReady] = useState<ServiceWorker | null>(null);
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (userAgent.includes('Mac') && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(userAgent);

  useEffect(() => {
    setInstalled(isStandalone());
    setOnline(navigator.onLine);

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      trackEvent('install_prompt_shown', { platform: 'native' });
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      trackEvent('pwa_installed');
    };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        if (registration.waiting) setUpdateReady(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdateReady(worker);
          });
        });
      }).catch(() => undefined);
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const value = useMemo<PWAState>(() => ({
    installed,
    isIOS,
    isSafari,
    canPrompt: Boolean(deferredPrompt),
    install: async () => {
      if (installed) return 'unavailable';
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (choice.outcome === 'dismissed') localStorage.setItem('kidzcoop:install-dismissed', String(Date.now()));
        return choice.outcome;
      }
      return isIOS && isSafari ? 'ios' : 'unavailable';
    },
  }), [deferredPrompt, installed, isIOS, isSafari]);

  return (
    <PWAContext.Provider value={value}>
      {!online && (
        <div role="status" className="fixed inset-x-3 top-[max(.75rem,env(safe-area-inset-top))] z-[80] mx-auto max-w-xl rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl">
          Sin conexión. Las historias visitadas siguen disponibles.
        </div>
      )}
      {updateReady && (
        <div className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[80] mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white shadow-2xl md:bottom-6">
          <span>Hay una nueva versión de KidZcoop disponible.</span>
          <button className="rounded-full bg-purple-600 px-4 py-2 font-bold" onClick={() => updateReady.postMessage({ type: 'SKIP_WAITING' })}>Actualizar</button>
        </div>
      )}
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const value = useContext(PWAContext);
  if (!value) throw new Error('usePWA must be used inside PWAProvider');
  return value;
}
