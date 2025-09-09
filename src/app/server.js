const express = require('express');
const mysql = require('mysql2');

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

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'database_name',
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.log('Database connection failed:', err.message);
    console.log('Server will continue running with mock data');
  } else {
    console.log('Connected to the database');
  }
});

app.get('/api/articles', (req, res) => {
  // Try to query the database, but provide mock data if it fails
  db.query(`
    SELECT 
      c.id,
      c.title,
      c.content_text,
      CONCAT('/articles/', c.id, '.png') as image_path,
      c.published_date
    FROM content c
    JOIN article a ON c.article_id = a.id
    WHERE c.language_id = 1
    ORDER BY c.published_date DESC
  `, (err, results) => {
    if (err) {
      console.log('Database query failed, returning mock data:', err.message);
      // Return mock data when database query fails
      const mockArticles = [
        {
          id: 1,
          title: "Elephant Artist Brushes Up the Forest! Ellie's Masterpieces Draw Giggles and Gasps!",
          content_text: "In a surprising twist to the art world's narrative, Ellie the elephant has been painting the town red—and green, and blue! With her trunk as her brush and the forest as her studio, Ellie crafts mesmerizing landscapes that are as lively as a spring meadow.",
          image_path: "/articles/1.png",
          published_date: "2024-06-07T22:47:15.000Z"
        },
        {
          id: 2,
          title: "Amazing Adventure in the Jungle!",
          content_text: "Join us on an incredible journey through the dense jungle where we discover amazing creatures, beautiful plants, and exciting adventures waiting around every corner.",
          image_path: "/articles/2.png",
          published_date: "2024-06-08T10:30:00.000Z"
        }
      ];
      console.log('Returning mock articles:', mockArticles);
      res.json(mockArticles);
      return;
    }
    console.log('Articles fetched from database:', results);
    res.json(results);
  });
});

// Get single article by ID
app.get('/api/articles/:id', (req, res) => {
  const articleId = req.params.id;
  
  db.query(`
    SELECT 
      c.id,
      c.title,
      c.content_text,
      CONCAT('/articles/', c.id, '.png') as image_path,
      c.published_date
    FROM content c
    JOIN article a ON c.article_id = a.id
    WHERE c.language_id = 1 AND c.id = ?
    ORDER BY c.published_date DESC
  `, [articleId], (err, results) => {
    if (err) {
      console.log('Database query failed, returning mock data:', err.message);
      // Return mock data when database query fails
      const mockArticles = [
        {
          id: 1,
          title: "Elephant Artist Brushes Up the Forest! Ellie's Masterpieces Draw Giggles and Gasps!",
          content_text: "In a surprising twist to the art world's narrative, Ellie the elephant has been painting the town red—and green, and blue! With her trunk as her brush and the forest as her studio, Ellie crafts mesmerizing landscapes that are as lively as a spring meadow.\n\nDiscovered by a nature-loving photographer who spotted her doodling with mud, Ellie has evolved her skills to wield actual brushes and canvases. Her vibrant pieces echo the hues of her woodland home, with each stroke telling a tale of the forest's enchanting beauty.\n\nArt connoisseurs and casual admirers alike are trekking into the woods, hoping to catch Ellie in action. Critics are especially taken with her unique flair for \"Impressionistic Realism,\" a term coined just for her that marries detailed forest scenes with a dreamlike quality. One critic even joked, \"With such talent, she might just be the next Vincent van Trunk!\"\n\nNot only is Ellie's art a festival of colors, but it's also a force for good. The proceeds from her art sales help fund local wildlife conservation projects, ensuring her forest friends stay safe and sound. As Ellie continues to draw crowds—and a few squirrels looking for autographs—her story proves that nature's palette is the most vibrant of all. And remember, in Ellie's gallery, everyone is encouraged to eat, drink, and be \"Mary Cass-ateer!\"",
          image_path: "/articles/1.png",
          published_date: "2024-06-07T22:47:15.000Z"
        },
        {
          id: 2,
          title: "Amazing Adventure in the Jungle!",
          content_text: "Join us on an incredible journey through the dense jungle where we discover amazing creatures, beautiful plants, and exciting adventures waiting around every corner.\n\nDeep in the heart of the tropical rainforest, where the trees reach high into the sky and the air is filled with the sounds of exotic birds, lies a world of wonder waiting to be explored. Every step reveals something new and exciting - from colorful butterflies dancing in the sunlight to mysterious animal calls echoing through the canopy.\n\nThe jungle is home to countless amazing creatures, each with their own special talents and secrets. Monkeys swing gracefully from branch to branch, showing off their incredible acrobatic skills. Colorful parrots chatter away in their own special language, while sloths move slowly and peacefully through their treetop homes.\n\nAs we venture deeper into this magical world, we discover that every plant and animal has an important role to play in keeping the jungle healthy and beautiful. It's a place where adventure awaits around every corner, and where the wonders of nature never cease to amaze us.",
          image_path: "/articles/2.png",
          published_date: "2024-06-08T10:30:00.000Z"
        }
      ];
      
      const article = mockArticles.find(a => a.id == articleId);
      if (article) {
        console.log('Returning mock article:', article);
        res.json(article);
      } else {
        res.status(404).json({ error: 'Article not found' });
      }
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    
    console.log('Article fetched from database:', results[0]);
    res.json(results[0]);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});