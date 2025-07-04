const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://xumm.app', 'wss://xrpl.ws'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://xrpfuzzy.com'],
      },
    },
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Initialize SQLite
const db = new sqlite3.Database('fuzzycommunityhub.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      userId TEXT PRIMARY KEY,  -- wallet address
      username TEXT UNIQUE,
      createdAt DATETIME
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      postId INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      username TEXT,
      content TEXT,
      createdAt DATETIME,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      commentId INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER,
      userId TEXT,
      username TEXT,
      content TEXT,
      createdAt DATETIME,
      FOREIGN KEY (postId) REFERENCES posts(postId),
      FOREIGN KEY (userId) REFERENCES users(userId)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      likeId INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER,
      userId TEXT,
      FOREIGN KEY (postId) REFERENCES posts(postId),
      FOREIGN KEY (userId) REFERENCES users(userId)
    )
  `);
});

// Helper to get next username number
function getNextFuzzyNumber() {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT username FROM users WHERE username LIKE 'fuzzy%' ORDER BY LENGTH(username) DESC, username DESC LIMIT 1`,
      [],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(1); // no user yet, start at 1

        // Extract number from username "fuzzy123"
        const match = row.username.match(/^fuzzy(\d+)$/);
        if (match) {
          resolve(parseInt(match[1], 10) + 1);
        } else {
          resolve(1);
        }
      }
    );
  });
}

// Endpoint to check or create user on login
app.post('/users/checkOrCreate', async (req, res) => {
  const { walletAddress } = req.body;
  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress required' });
  }

  // Check if user exists
  db.get('SELECT * FROM users WHERE userId = ?', [walletAddress], async (err, user) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (user) {
      // User exists, return username
      return res.json({ userId: user.userId, username: user.username });
    } else {
      // Create new user with next fuzzy username
      try {
        const nextNum = await getNextFuzzyNumber();
        const username = `fuzzy${nextNum}`;
        const createdAt = new Date().toISOString();

        db.run(
          'INSERT INTO users (userId, username, createdAt) VALUES (?, ?, ?)',
          [walletAddress, username, createdAt],
          function (insertErr) {
            if (insertErr) {
              console.error('Insert user error:', insertErr);
              return res.status(500).json({ error: 'Failed to create user' });
            }
            return res.json({ userId: walletAddress, username });
          }
        );
      } catch (error) {
        console.error('Error generating username:', error);
        return res.status(500).json({ error: 'Failed to assign username' });
      }
    }
  });
});

// Other endpoints for posts, comments, likes as you had before...
// I'll include them again here for completeness:

// Create post
app.post('/posts', (req, res) => {
  const { userId, username, content } = req.body;
  if (!userId || !username || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT INTO posts (userId, username, content, createdAt) VALUES (?, ?, ?, ?)',
    [userId, username, content, new Date().toISOString()],
    function (err) {
      if (err) {
        console.error('Post error:', err);
        return res.status(500).json({ error: 'Failed to create post' });
      }
      res.json({ postId: this.lastID });
    }
  );
});

// Get posts
app.get('/posts', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error('Get posts error:', err);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
    res.json(rows);
  });
});

// Add comment
app.post('/comments', (req, res) => {
  const { postId, userId, username, content } = req.body;
  if (!postId || !userId || !username || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT INTO comments (postId, userId, username, content, createdAt) VALUES (?, ?, ?, ?, ?)',
    [postId, userId, username, content, new Date().toISOString()],
    function (err) {
      if (err) {
        console.error('Comment error:', err);
        return res.status(500).json({ error: 'Failed to add comment' });
      }
      res.json({ commentId: this.lastID });
    }
  );
});

// Add like
app.post('/likes', (req, res) => {
  const { postId, userId } = req.body;
  if (!postId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.get('SELECT * FROM likes WHERE postId = ? AND userId = ?', [postId, userId], (err, row) => {
    if (err) {
      console.error('Like check error:', err);
      return res.status(500).json({ error: 'Failed to check like' });
    }
    if (row) {
      return res.status(400).json({ error: 'Already liked' });
    }
    db.run(
      'INSERT INTO likes (postId, userId) VALUES (?, ?)',
      [postId, userId],
      function (err) {
        if (err) {
          console.error('Like error:', err);
          return res.status(500).json({ error: 'Failed to add like' });
        }
        res.json({ likeId: this.lastID });
      }
    );
  });
});

// Get likes for a post
app.get('/likes/:postId', (req, res) => {
  const { postId } = req.params;
  db.all('SELECT userId FROM likes WHERE postId = ?', [postId], (err, rows) => {
    if (err) {
      console.error('Get likes error:', err);
      return res.status(500).json({ error: 'Failed to fetch likes' });
    }
    res.json(rows);
  });
});

// Get comments for a post
app.get('/comments/:postId', (req, res) => {
  const { postId } = req.params;
  db.all('SELECT * FROM comments WHERE postId = ? ORDER BY createdAt', [postId], (err, rows) => {
    if (err) {
      console.error('Get comments error:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
    res.json(rows);
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
