const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'database_name',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

app.get('/api/articles', (req, res) => {
  db.query('SELECT * FROM articles', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});