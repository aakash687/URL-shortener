const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const port = 3000;

// In-memory store for URL mappings and analytics
const urlDatabase = {};

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper function to generate short ID
function generateShortId() {
  return crypto.randomBytes(3).toString('hex'); // 6 characters
}

// Endpoint to create short URL
app.post('/api/shorten', (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }
  // Check if URL already exists
  for (const shortId in urlDatabase) {
    if (urlDatabase[shortId].originalUrl === originalUrl) {
      return res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${shortId}` });
    }
  }
  const shortId = generateShortId();
  urlDatabase[shortId] = { originalUrl, clicks: 0 };
  res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${shortId}` });
});

// Endpoint to redirect short URL to original URL
app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const entry = urlDatabase[shortId];
  if (entry) {
    entry.clicks++;
    res.redirect(entry.originalUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

// Endpoint to get analytics for a short URL
app.get('/api/analytics/:shortId', (req, res) => {
  const { shortId } = req.params;
  const entry = urlDatabase[shortId];
  if (entry) {
    res.json({ originalUrl: entry.originalUrl, clicks: entry.clicks });
  } else {
    res.status(404).json({ error: 'URL not found' });
  }
});

app.listen(port, () => {
  console.log(`URL shortener app listening at http://localhost:${port}`);
});
