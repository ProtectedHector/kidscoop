export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kidzcoop.app').replace(/\/+$/, '');

export const SITE_NAME = 'KidZcoop';

/** Request header set by middleware with the language from the URL. */
export const LANGUAGE_HEADER = 'x-kidzcoop-language';

export const SOCIAL_PROFILES = [
  'https://www.instagram.com/kidzcoop/',
  'https://www.facebook.com/profile.php?id=61593987484167',
] as const;

export const SOCIAL_IMAGE = {
  path: '/social-logo.png',
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: 'KidZcoop logo',
} as const;

export function absoluteUrl(path: string, baseUrl = SITE_URL) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
