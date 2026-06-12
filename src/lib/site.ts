export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kidscoop.vercel.app';

export const SOCIAL_IMAGE = {
  path: '/social-share.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'KidScoop',
} as const;

export function absoluteUrl(path: string, baseUrl = SITE_URL) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
