const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const xrpl = require('xrpl');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors({ origin: 'https://http://localhost:5173/' }));
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://xumm.app', 'wss://xrpl.ws'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://xrpfuzzy.com']
    }
  }
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 
}));

// Initialize SQLite
const db = new sqlite3.Database('fuzzycommunityhub.db', (err) => {
  if (err) console.error('Database error:', err);
  console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      userId TEXT PRIMARY KEY,
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

// Generate session token
function generateSessionToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

// Verify XRPL signature and create session
app.post('/auth/xaman', async (req, res) => {
  const { walletAddress, signature, nonce } = req.body;
  if (!walletAddress || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const client = new xrpl.Client('wss://xrpl.ws');
    await client.connect();
    const isValid = xrpl.verifySignature(nonce, signature, walletAddress);
    await client.disconnect();

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const userId = require('crypto').randomUUID();
    const sessionToken = generateSessionToken();
    res.json({ token: sessionToken, userId });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Save username
app.post('/auth/username', (req, res) => {
  const { userId, username } = req.body;
  if (!userId || !username) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[a-zA-Z0-9_-]{3,16}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3-16 characters, letters, numbers, _, or -' });
  }
  db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Username check error:', err);
      return res.status(500).json({ error: 'Failed to check username' });
    }
    if (row) {
      return res.status(400).json({ error: 'Username taken' });
    }
    db.run(
      'INSERT INTO users (userId, username, createdAt) VALUES (?, ?, ?)',
      [userId, username, new Date().toISOString()],
      (err) => {
        if (err) {
          console.error('Username save error:', err);
          return res.status(500).json({ error: 'Failed to save username' });
        }
        res.json({ message: 'Username saved' });
      }
    );
  });
});

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