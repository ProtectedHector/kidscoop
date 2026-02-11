type SheetRow = Record<string, string>;

export interface Article {
  id: number;
  content_id: number;
  name: string;
  language: string;
  title: string;
  content_text: string;
  lyrics: string;
  image_path: string;
  published_date: string;
  lyrics_language?: string;
}

const GOOGLE_SHEETS_ARTICLES_URL = process.env.GOOGLE_SHEETS_ARTICLES_URL || '';
const GOOGLE_SHEETS_CONTENT_URL = process.env.GOOGLE_SHEETS_CONTENT_URL || '';

function parseCSV(csvText: string): SheetRow[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.trim() || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  const records: SheetRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length >= headers.length) {
      const record: SheetRow = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      records.push(record);
    }
  }

  return records;
}

async function fetchFromSheet(url: string): Promise<SheetRow[]> {
  if (!url) {
    throw new Error('Sheet URL not configured');
  }

  const res = await fetch(url, { redirect: 'follow' });
  const data = await res.text();

  if (!res.ok) {
    throw new Error(`Failed to fetch Google Sheet (status ${res.status})`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html') || data.trim().startsWith('<')) {
    throw new Error(
      'Received HTML instead of CSV. Make sure the sheet is public and the URL/GID is correct.'
    );
  }

  return parseCSV(data);
}

export async function fetchArticlesWithContent(language: string): Promise<Article[]> {
  if (!GOOGLE_SHEETS_ARTICLES_URL || !GOOGLE_SHEETS_CONTENT_URL) {
    throw new Error(
      'Google Sheets URLs not configured. Please set GOOGLE_SHEETS_ARTICLES_URL and GOOGLE_SHEETS_CONTENT_URL.'
    );
  }

  const normalizedLanguage = (language || 'en').toLowerCase();

  const [articlesData, contentData] = await Promise.all([
    fetchFromSheet(GOOGLE_SHEETS_ARTICLES_URL),
    fetchFromSheet(GOOGLE_SHEETS_CONTENT_URL),
  ]);

  const articlesMap: Record<number, { id: number; name: string }> = {};

  articlesData.forEach((article) => {
    const id = parseInt(article.id || article.ID || '0', 10);
    const deleted = parseInt(article.deleted || article.Deleted || '0', 10);
    const name = article.name || article.Name || '';

    if (id > 0 && deleted === 0) {
      articlesMap[id] = { id, name };
    }
  });

  const joinedArticles = contentData
    .map((content) => {
      const contentId = parseInt(content.id || content.ID || '0', 10);
      const articleId = parseInt(
        content.article_id || content.article_ID || content.Article_ID || '0',
        10
      );
      const contentLanguage = (
        content.language ||
        content.Language ||
        content.lang ||
        'en'
      ).toLowerCase();
      const published = parseInt(content.published || content.Published || '0', 10);

      if (
        contentId > 0 &&
        articleId > 0 &&
        published === 1 &&
        contentLanguage === normalizedLanguage &&
        articlesMap[articleId]
      ) {
        const lyrics = content.lyrics || content.Lyrics || content.LYRICS || '';

        return {
          id: articleId,
          content_id: contentId,
          name: articlesMap[articleId].name,
          language: contentLanguage,
          title: content.title || content.Title || '',
          content_text: content.content_text || content.content || content.Content || '',
          lyrics,
          image_path: `/articles/${articleId}.png`,
          published_date:
            content.published_date ||
            content.date ||
            content.Date ||
            new Date().toISOString(),
        };
      }

      return null;
    })
    .filter((article): article is Article => Boolean(article && article.title));

  return joinedArticles;
}
