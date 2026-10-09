type AnalyticsValue = string | number | boolean | undefined;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, AnalyticsValue>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, parameters: Record<string, AnalyticsValue> = {}) {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, parameters);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...parameters });
}
