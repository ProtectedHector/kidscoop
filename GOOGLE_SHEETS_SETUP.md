# Google Sheets Setup Guide

Your app now uses Google Sheets instead of a database! This means you can edit your articles directly in Google Sheets and they'll automatically update on your website.

## 📋 Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "KidScoop Articles"

## 📊 Step 2: Set Up Your Sheet Structure

Your Google Sheet should have **two tabs**:

### Tab 1: "Article" (Article Metadata)
This tab contains article information that's shared across all languages.

**Tab Name:** `Article` (singular)

**Columns:**
| id | name | deleted |
|---|---|---|
| 1 | Elephant Artist Story | 0 |
| 2 | Jungle Adventure | 0 |

**Column Details:**
- **id**: Unique number for each article (1, 2, 3, etc.)
- **name**: Article name/identifier (can be used for internal reference, not displayed to users)
- **deleted**: `0` = active article (shown), `1` = deleted article (hidden from website)
- You can add any other columns you need for article metadata

### Tab 2: "Content" (Language-Specific Content)
This tab contains the actual content for each article in different languages.

**Tab Name:** `Content` (singular)

**Columns:**
| id | article_id | language | title | content_text | published_date | published | lyrics |
|---|---|---|---|---|---|---|---|
| 1 | 1 | en | Elephant Artist Brushes Up the Forest! | Full article content... | 2024-06-07T22:47:15.000Z | 1 | Song lyrics in English... |
| 2 | 1 | es | Artista Elefante Pinta el Bosque | Contenido completo del artículo... | 2024-06-07T22:47:15.000Z | 1 | Letra de la canción en español... |
| 3 | 2 | en | Amazing Adventure in the Jungle! | Full article content... | 2024-06-08T10:30:00.000Z | 1 | Song lyrics... |
| 4 | 2 | es | ¡Aventura Increíble en la Selva! | Contenido completo del artículo... | 2024-06-08T10:30:00.000Z | 1 | Letra de la canción... |

**Column Details:**
- **id**: Unique content ID (1, 2, 3, etc.) - each content row has its own ID
- **article_id**: References the article ID from Tab 1 (links content to article)
- **language**: ISO 639-1 language code (e.g., `en`, `es`, `fr`, `de`, `it`, `pt`, `zh`, `ja`, `ko`, `ar`, `hi`, `ru`)
- **title**: The article title in the specified language
- **content_text**: The full article content in the specified language (can include line breaks with `\n\n`)
- **published_date**: Date in ISO format (e.g., `2024-06-07T22:47:15.000Z`)
- **published**: `1` = published (shown on website), `0` = draft/unpublished (hidden from website)
- **lyrics**: (Optional) Song lyrics for the article in the specified language. If not provided for the current language, English lyrics will be shown as fallback

### 🌍 Language Support:
The app supports multiple languages using standard ISO 639-1 codes:
- **en** - English 🇺🇸
- **es** - Español 🇪🇸
- **fr** - Français 🇫🇷
- **de** - Deutsch 🇩🇪
- **it** - Italiano 🇮🇹
- **pt** - Português 🇵🇹
- **zh** - 中文 🇨🇳
- **ja** - 日本語 🇯🇵
- **ko** - 한국어 🇰🇷
- **ar** - العربية 🇸🇦
- **hi** - हिन्दी 🇮🇳
- **ru** - Русский 🇷🇺

**Important**: 
- Tab names should be: `Article` (singular) and `Content` (singular)
- Each article in the "Article" tab can have multiple content rows in the "Content" tab (one per language)
- The `article_id` in the "Content" tab must match an `id` in the "Article" tab
- The same article can have content in multiple languages
- Only articles with `deleted = 0` will be shown
- Only content with `published = 1` will be shown
- Both conditions must be met for an article to appear on the website

## 🔗 Step 3: Make Your Sheet Public

1. Click **Share** button (top right)
2. Click **Change to anyone with the link**
3. Set permission to **Viewer**
4. Click **Done**

## 🔑 Step 4: Get Your Sheet URL

1. Look at your browser's address bar
2. You'll see a URL like: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
3. Copy the **YOUR_SHEET_ID** part (the long string of letters and numbers)

## ⚙️ Step 5: Get Your Sheet Tab IDs

You need to get the GID (Google Sheet ID) for both tabs:

1. Click on the **"Article"** tab - Look at the URL, you'll see `gid=XXXXX`
2. Click on the **"Content"** tab - Look at the URL, you'll see `gid=YYYYY`
3. Note down both GIDs

**Tip:** The first tab usually has `gid=0`, but check to be sure! The GID is what matters, not the tab name.

## ⚙️ Step 6: Configure Your App

1. Open your `.env.local` file (or create it if it doesn't exist)
2. Add these two lines:

```
GOOGLE_SHEETS_ARTICLES_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=ARTICLES_TAB_GID
GOOGLE_SHEETS_CONTENT_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=CONTENT_TAB_GID
```

Replace:
- `YOUR_SHEET_ID` with the Sheet ID you copied in Step 4
- `ARTICLES_TAB_GID` with the GID from Tab 1 (usually `0`)
- `CONTENT_TAB_GID` with the GID from Tab 2 (usually `1` or another number)

**Example:**
```
GOOGLE_SHEETS_ARTICLES_URL=https://docs.google.com/spreadsheets/d/abc123xyz/export?format=csv&gid=0
GOOGLE_SHEETS_CONTENT_URL=https://docs.google.com/spreadsheets/d/abc123xyz/export?format=csv&gid=1234567890
```

## ✅ Step 7: Test It!

1. Restart your server: `node src/app/server.js`
2. Visit `http://localhost:3001/api/articles`
3. You should see your articles from the Google Sheet!

## 🎨 Tips:

- **Image files**: Make sure your image files are named `1.png`, `2.png`, etc. in the `/public/articles/` folder
- **Audio files**: Name your MP3 files with format `{id}_{language}.mp3` (e.g., `1_en.mp3`, `1_es.mp3`, `2_fr.mp3`) in the `/public/articles/` folder
- **Coloring pages**: Name your coloring page images as `{id}c.png` (e.g., `1c.png`, `2c.png`) in the `/public/articles/` folder
- **Content formatting**: Use `\n\n` in your Google Sheet to create paragraph breaks
- **Lyrics**: Add lyrics in the `lyrics` column. If lyrics are not available for a language, English lyrics will be shown as fallback
- **Real-time updates**: Changes in your Google Sheet will appear on your website immediately (no need to restart the server)
- **Multiple columns**: The parser is flexible - it will work with column names like `id`, `ID`, `title`, `Title`, `content_text`, `content`, `Content`, etc.

## 🚀 That's it!

Now you can manage all your articles directly in Google Sheets - no database needed! 🎉
