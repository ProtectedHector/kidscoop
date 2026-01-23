// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const https = require('https');

const app = express();
const port = 3001;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Parse JSON bodies
app.use(express.json());

// Google Sheets CSV export URLs
// Format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
// Get SHEET_ID from your Google Sheets URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
// Tab 1 ("Article" tab): gid=0 (usually) - find the GID in the URL when you click on that tab
// Tab 2 ("Content" tab): gid=1 (usually) - find the GID in the URL when you click on that tab
const GOOGLE_SHEETS_ARTICLES_URL = process.env.GOOGLE_SHEETS_ARTICLES_URL || '';
const GOOGLE_SHEETS_CONTENT_URL = process.env.GOOGLE_SHEETS_CONTENT_URL || '';

// Improved CSV parser that handles quoted fields with commas and newlines
function parseCSV(csvText) {
  // Debug: show first 500 chars of CSV
  console.log('📄 CSV Data preview (first 500 chars):', csvText.substring(0, 500));
  
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  
  // Parse character by character, handling quoted fields properly
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    const prevChar = csvText[i - 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote ("")
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        // Don't add the quote character itself to the field
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator (only when not in quotes)
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // Row separator (only when not in quotes)
      // Handle \r\n (Windows line endings)
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip the \n
      }
      // Push the last field and the row
      currentRow.push(currentField.trim());
      if (currentRow.length > 0 && currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      // Regular character
      currentField += char;
    }
  }
  
  // Don't forget the last field and row
  if (currentField.trim() || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.length > 0 && currentRow.some(f => f.length > 0)) {
      rows.push(currentRow);
    }
  }
  
  if (rows.length < 2) {
    console.warn('⚠️  CSV has less than 2 rows');
    return [];
  }
  
  // First row is headers
  const headers = rows[0];
  console.log('📋 CSV Headers:', headers);
  
  // Parse data rows
  const articles = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    
    if (values.length >= headers.length) {
      const article = {};
      headers.forEach((header, index) => {
        article[header] = values[index] || '';
      });
      articles.push(article);
      
      // Debug first row
      if (i === 1) {
        console.log('📝 First row parsed:', Object.keys(article).reduce((acc, key) => {
          const val = article[key];
          acc[key] = (val && val.length > 0) 
            ? (val.substring(0, 50) + (val.length > 50 ? '...' : ''))
            : '(empty)';
          return acc;
        }, {}));
      }
    } else {
      console.warn(`⚠️  Row ${i} has ${values.length} fields but expected ${headers.length}`);
    }
  }
  
  console.log(`✅ Parsed ${articles.length} rows from CSV`);
  return articles;
}

// Fetch data from Google Sheets (handles redirects)
async function fetchFromSheet(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('Sheet URL not configured'));
      return;
    }
    
    if (maxRedirects === 0) {
      reject(new Error('Too many redirects'));
      return;
    }
    
    https.get(url, (res) => {
      // Handle redirects (3xx status codes)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location;
        console.log(`   ↪️  Following redirect to: ${redirectUrl}`);
        // Recursively follow the redirect
        return fetchFromSheet(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }
      
      let data = '';
      
      console.log(`📥 Fetching from: ${url}`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      
      // Check if we got HTML instead of CSV (usually means error or not public)
      if (res.headers['content-type'] && res.headers['content-type'].includes('text/html')) {
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          // Try to extract redirect URL from HTML if it's a redirect page
          const redirectMatch = data.match(/HREF="([^"]+)"/i);
          if (redirectMatch && redirectMatch[1]) {
            const redirectUrl = redirectMatch[1].replace(/&amp;/g, '&');
            console.log(`   ↪️  Found redirect in HTML, following: ${redirectUrl}`);
            return fetchFromSheet(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
          }
          
          console.error('❌ Received HTML instead of CSV');
          console.error('   URL:', url);
          console.error('   Status Code:', res.statusCode);
          console.error('   Response preview (first 500 chars):', data.substring(0, 500));
          reject(new Error('Received HTML instead of CSV. Make sure your Google Sheet is public (Share → Anyone with link → Viewer) and the URL/GID is correct.'));
        });
        return;
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Check if response is HTML (error page)
          if (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html') || data.includes('<HTML>') || data.includes('<!doctype')) {
            // Try to extract redirect URL from HTML
            const redirectMatch = data.match(/HREF="([^"]+)"/i);
            if (redirectMatch && redirectMatch[1]) {
              const redirectUrl = redirectMatch[1].replace(/&amp;/g, '&');
              console.log(`   ↪️  Found redirect in HTML, following: ${redirectUrl}`);
              return fetchFromSheet(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
            }
            
            console.error('❌ Received HTML instead of CSV from Google Sheets');
            console.error('   URL:', url);
            console.error('   Status Code:', res.statusCode);
            console.error('   Response preview (first 500 chars):', data.substring(0, 500));
            reject(new Error('Google Sheets returned HTML instead of CSV. Check: 1) Sheet is public (Share → Anyone with link → Viewer), 2) URL is correct, 3) GID (tab ID) is correct'));
            return;
          }
          
          const rows = parseCSV(data);
          if (rows.length === 0 && data.trim().length > 0) {
            console.warn('⚠️  CSV parsed but got 0 rows. Data preview:', data.substring(0, 200));
          }
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Fetch and join articles with content
async function fetchArticlesWithContent(language) {
  try {
    // Check if URLs are configured
    if (!GOOGLE_SHEETS_ARTICLES_URL || !GOOGLE_SHEETS_CONTENT_URL) {
      throw new Error('Google Sheets URLs not configured. Please set GOOGLE_SHEETS_ARTICLES_URL and GOOGLE_SHEETS_CONTENT_URL in .env.local');
    }
    
    // Fetch both tabs in parallel
    const [articlesData, contentData] = await Promise.all([
      fetchFromSheet(GOOGLE_SHEETS_ARTICLES_URL),
      fetchFromSheet(GOOGLE_SHEETS_CONTENT_URL)
    ]);
    
    console.log(`Fetched ${articlesData.length} articles and ${contentData.length} content rows from Google Sheets`);
    
    // Create a map of articles by id (filter out deleted articles)
    const articlesMap = {};
    articlesData.forEach((article, index) => {
      const id = parseInt(article.id || article.ID || 0);
      const deleted = parseInt(article.deleted || article.Deleted || article.deleted || 0);
      const name = article.name || article.Name || '';
      
      // Debug first few articles
      if (index < 3) {
        console.log(`Article ${index + 1}: id=${id}, deleted=${deleted}, name="${name}"`);
        console.log(`  Raw data keys:`, Object.keys(article));
      }
      
      // Only include non-deleted articles
      if (id > 0 && deleted === 0) {
        articlesMap[id] = {
          id: id,
          name: name
        };
      } else if (id > 0) {
        console.log(`  ⚠️  Article ${id} excluded: deleted=${deleted}`);
      }
    });
    
    console.log(`Found ${Object.keys(articlesMap).length} active articles (non-deleted)`);
    if (Object.keys(articlesMap).length === 0 && articlesData.length > 0) {
      console.log(`⚠️  WARNING: All ${articlesData.length} articles are marked as deleted or have invalid IDs!`);
      console.log(`   Make sure your "Article" tab has: id, name, deleted (0 for active, 1 for deleted)`);
    }
    
    // Filter content by language, published status, and join with articles
    let debugCount = 0;
    const joinedArticles = contentData
      .map((content, index) => {
        const contentId = parseInt(content.id || content.ID || 0);
        const articleId = parseInt(content.article_id || content.article_ID || content.Article_ID || 0);
        const contentLanguage = (content.language || content.Language || content.lang || 'en').toLowerCase();
        const published = parseInt(content.published || content.Published || 0);
        
        // Debug first few content rows
        if (index < 3) {
          console.log(`Content ${index + 1}: contentId=${contentId}, articleId=${articleId}, language="${contentLanguage}", published=${published}`);
          console.log(`  Raw data keys:`, Object.keys(content));
        }
        
        // Filter: must be published, correct language, and article must exist and not be deleted
        if (contentId > 0 && 
            articleId > 0 && 
            published === 1 && 
            contentLanguage === language.toLowerCase() && 
            articlesMap[articleId]) {
          return {
            id: articleId, // Use article_id for the final article ID
            content_id: contentId, // Keep content ID for reference
            name: articlesMap[articleId].name,
            language: contentLanguage,
            title: content.title || content.Title || '',
            content_text: content.content_text || content.content || content.Content || '',
            lyrics: content.lyrics || content.Lyrics || '',
            image_path: `/articles/${articleId}.png`,
            published_date: content.published_date || content.date || content.Date || new Date().toISOString()
          };
        } else {
          debugCount++;
          if (debugCount <= 3) {
            if (contentId === 0) console.log(`  ⚠️  Content row ${index + 1} excluded: invalid contentId`);
            if (articleId === 0) console.log(`  ⚠️  Content row ${index + 1} excluded: invalid articleId`);
            if (published !== 1) console.log(`  ⚠️  Content row ${index + 1} excluded: published=${published} (needs to be 1)`);
            if (contentLanguage !== language.toLowerCase()) console.log(`  ⚠️  Content row ${index + 1} excluded: language="${contentLanguage}" (needs "${language}")`);
            if (articleId > 0 && !articlesMap[articleId]) console.log(`  ⚠️  Content row ${index + 1} excluded: articleId ${articleId} not found in articles or is deleted`);
          }
        }
        return null;
      })
      .filter(article => article !== null && article.title);
    
    console.log(`Joined ${joinedArticles.length} articles for language: ${language}`);
    return joinedArticles;
  } catch (error) {
    console.error('Error in fetchArticlesWithContent:', error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: port, timestamp: new Date().toISOString() });
});

app.get('/api/articles', async (req, res) => {
  try {
    // Get language from query parameter, default to 'en'
    const language = req.query.lang || req.query.language || 'en';
    
    const articles = await fetchArticlesWithContent(language);
    
    // Sort by published_date descending
    articles.sort((a, b) => {
      const dateA = new Date(a.published_date).getTime();
      const dateB = new Date(b.published_date).getTime();
      return dateB - dateA;
    });
    
    console.log(`✅ Successfully fetched ${articles.length} articles from Google Sheets for language: ${language}`);
    res.json(articles);
  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error.message);
    console.error('Stack:', error.stack);
    
    // Return error response with details
    res.status(500).json({ 
      error: 'Failed to fetch articles',
      message: error.message,
      hint: 'Check that GOOGLE_SHEETS_ARTICLES_URL and GOOGLE_SHEETS_CONTENT_URL are set in .env.local'
    });
  }
});

// Get single article by ID
app.get('/api/articles/:id', async (req, res) => {
  const articleId = parseInt(req.params.id);
  // Get language from query parameter, default to 'en'
  const language = req.query.lang || req.query.language || 'en';
  
  try {
    const articles = await fetchArticlesWithContent(language);
    let article = articles.find(a => a.id === articleId);
    
    // If article found but no lyrics in current language, try to get English lyrics as fallback
    if (article && article.title && (!article.lyrics || article.lyrics.trim() === '') && language !== 'en') {
      try {
        const enArticles = await fetchArticlesWithContent('en');
        const enArticle = enArticles.find(a => a.id === articleId);
        if (enArticle && enArticle.lyrics && enArticle.lyrics.trim() !== '') {
          article.lyrics = enArticle.lyrics;
          article.lyrics_language = 'en'; // Mark that lyrics are in English
          console.log(`Using English lyrics as fallback for article ${articleId} in language ${language}`);
        }
      } catch (error) {
        console.log('Could not fetch English lyrics as fallback:', error.message);
      }
    } else if (article && article.lyrics && article.lyrics.trim() !== '') {
      // Mark that lyrics are in the current language
      article.lyrics_language = language;
    }
    
    if (article && article.title) {
      console.log(`Fetched article ${articleId} from Google Sheets for language: ${language}`);
      res.json(article);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.log('Error fetching from Google Sheets:', error.message);
    // Return mock data as fallback
    const mockArticles = [
      {
        id: 1,
        name: "Elephant Artist Story",
        language: 'en',
        title: "Elephant Artist Brushes Up the Forest! Ellie's Masterpieces Draw Giggles and Gasps!",
        content_text: "In a surprising twist to the art world's narrative, Ellie the elephant has been painting the town red—and green, and blue! With her trunk as her brush and the forest as her studio, Ellie crafts mesmerizing landscapes that are as lively as a spring meadow.\n\nDiscovered by a nature-loving photographer who spotted her doodling with mud, Ellie has evolved her skills to wield actual brushes and canvases. Her vibrant pieces echo the hues of her woodland home, with each stroke telling a tale of the forest's enchanting beauty.\n\nArt connoisseurs and casual admirers alike are trekking into the woods, hoping to catch Ellie in action. Critics are especially taken with her unique flair for \"Impressionistic Realism,\" a term coined just for her that marries detailed forest scenes with a dreamlike quality. One critic even joked, \"With such talent, she might just be the next Vincent van Trunk!\"\n\nNot only is Ellie's art a festival of colors, but it's also a force for good. The proceeds from her art sales help fund local wildlife conservation projects, ensuring her forest friends stay safe and sound. As Ellie continues to draw crowds—and a few squirrels looking for autographs—her story proves that nature's palette is the most vibrant of all. And remember, in Ellie's gallery, everyone is encouraged to eat, drink, and be \"Mary Cass-ateer!\"",
        image_path: "/articles/1.png",
        published_date: "2024-06-07T22:47:15.000Z"
      },
      {
        id: 2,
        name: "Jungle Adventure",
        language: 'en',
        title: "Amazing Adventure in the Jungle!",
        content_text: "Join us on an incredible journey through the dense jungle where we discover amazing creatures, beautiful plants, and exciting adventures waiting around every corner.\n\nDeep in the heart of the tropical rainforest, where the trees reach high into the sky and the air is filled with the sounds of exotic birds, lies a world of wonder waiting to be explored. Every step reveals something new and exciting - from colorful butterflies dancing in the sunlight to mysterious animal calls echoing through the canopy.\n\nThe jungle is home to countless amazing creatures, each with their own special talents and secrets. Monkeys swing gracefully from branch to branch, showing off their incredible acrobatic skills. Colorful parrots chatter away in their own special language, while sloths move slowly and peacefully through their treetop homes.\n\nAs we venture deeper into this magical world, we discover that every plant and animal has an important role to play in keeping the jungle healthy and beautiful. It's a place where adventure awaits around every corner, and where the wonders of nature never cease to amaze us.",
        image_path: "/articles/2.png",
        published_date: "2024-06-08T10:30:00.000Z"
      }
    ];
    
    const article = mockArticles.find(a => a.id === articleId && a.language === language.toLowerCase());
    if (article) {
      console.log('Returning mock article as fallback');
      res.json(article);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  }
});

app.listen(port, () => {
  console.log('='.repeat(50));
  console.log(`✅ Express API Server running on port ${port}`);
  console.log(`📡 API Endpoint: http://localhost:${port}/api/articles?lang=en`);
  console.log('='.repeat(50));
  
  // Check if environment variables are set
  if (!GOOGLE_SHEETS_ARTICLES_URL || !GOOGLE_SHEETS_CONTENT_URL) {
    console.warn('⚠️  WARNING: Google Sheets URLs not configured!');
    console.warn('   Please set GOOGLE_SHEETS_ARTICLES_URL (for "Article" tab) and GOOGLE_SHEETS_CONTENT_URL (for "Content" tab) in .env.local');
  } else {
    console.log('✅ Google Sheets URLs configured');
  }
  console.log('');
});