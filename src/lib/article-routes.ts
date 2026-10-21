export function slugifyTitle(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug || 'article';
}

export function getArticlePath(language: string, articleId: number | string, title: string): string {
  return `/${language}/article/${articleId}/${slugifyTitle(title)}`;
}
