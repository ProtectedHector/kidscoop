export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kidzcoop.vercel.app';

export const SOCIAL_IMAGE = {
  path: '/logo.png',
  width: 1190,
  height: 1277,
  type: 'image/png',
  alt: 'KidZcoop logo',
} as const;

export function absoluteUrl(path: string, baseUrl = SITE_URL) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
