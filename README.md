# KidScoop - Amazing Stories for Kids

A Next.js application for sharing amazing stories for kids in multiple languages.

## Features

- 🌍 Multi-language support (en, es, fr, de, it, pt)
- 📚 Dynamic article content from Google Sheets
- 🎨 Beautiful, kid-friendly UI with animations
- 🎵 Audio stories with lyrics
- 🖍️ Coloring pages for each story
- 📊 Visit tracking and analytics
- 🔍 SEO optimized with structured data
- 🗺️ Automatic sitemap generation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Sheets with article data (see `GOOGLE_SHEETS_SETUP.md`)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env.local`:
```env
GOOGLE_SHEETS_ARTICLES_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
GOOGLE_SHEETS_CONTENT_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=1
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
API_URL=http://localhost:3001
```

4. Run the development server:
```bash
npm run dev
```

5. In a separate terminal, run the API server:
```bash
npm run server
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/contexts/` - React contexts (Language)
- `src/hooks/` - Custom React hooks
- `src/translations/` - Translation files
- `public/articles/` - Article images and audio files
- `src/app/server.js` - Express API server

## Visit Logging

Visit logs are stored in `logs/visits.csv` with format:
```
date,type,article_id,language
2024-01-23,article,1,en
2024-01-23,home,en
```

## Image Generation

To generate images for articles using OpenAI DALL-E:

1. Install dependencies:
```bash
pip install openai pillow requests
```

2. Set API key:
```bash
export OPENAI_API_KEY='your-api-key'
```

3. Generate images:
```bash
# Option 1: Single article with manual title/content
python3 generate_images.py --article-id 1 --title "Article Title" --content "Article content..."

# Option 2: Multiple articles from CSV (comma-separated IDs)
python3 generate_images.py --article-ids "1,2,3,5" --csv new_articles_all_languages.csv

# Option 3: All articles from CSV
python3 generate_images.py --all --csv new_articles_all_languages.csv
```

**Options:**
- `--article-id` - Single article ID (requires `--title` and optionally `--content`)
- `--article-ids` - Comma-separated article IDs (reads from CSV automatically)
- `--all` - Generate for all articles in CSV
- `--csv` - CSV file path (default: `new_articles_all_languages.csv`)
- `--output-dir` - Output directory (default: `public/articles`)
- `--title` - Article title (required when using `--article-id`)
- `--content` - Article content (optional when using `--article-id`)

**Output:**
Images are saved to `public/articles/`:
- `{article_id}.png` - Colored illustration
- `{article_id}c.png` - Black & white coloring page

**Note:** When using `--article-ids` or `--all`, the script automatically reads article titles and content from the CSV file (English versions only).

## SEO Features

- Dynamic metadata for each page
- Structured data (JSON-LD) for articles and organization
- Automatic sitemap generation (`/sitemap.xml`)
- Robots.txt configuration
- Open Graph and Twitter Card support
- Canonical URLs and language alternates

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Set environment variables
4. Deploy!

## Prompt for Next Development Session

**Context**: This is a Next.js 14 application for a kids' story website called KidScoop. The app:
- Uses Google Sheets as a CMS (Article and Content tabs)
- Supports 6 languages: en, es, fr, de, it, pt
- Has an Express.js API server on port 3001
- Uses Next.js App Router with TypeScript
- Has visit logging to `logs/visits.csv` (date-only format)
- Generates images using OpenAI DALL-E API
- Is SEO optimized with structured data, sitemap, and robots.txt

## Prompt for generating images
Generate two images sepparted! two files. one in colour (filename {id}.png) one as kids coloring, so in white just with the black lines (filename {id}c.png) that represents this story.


**Key Files**:
- `src/app/server.js` - Express API server
- `src/app/[language]/page.tsx` - Language-specific home page
- `src/app/[language]/content/[id]/page.tsx` - Article content page
- `src/components/Home.tsx` - Article listing component
- `generate_images.py` - Image generation script
- `GOOGLE_SHEETS_SETUP.md` - Google Sheets setup guide

**Next Steps**: Continue improving SEO, add more languages, enhance analytics, or add new features as requested.
