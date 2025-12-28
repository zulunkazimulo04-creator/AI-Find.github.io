const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to JSON file
const dataPath = path.join(__dirname, 'ais.json');

// Read JSON
function readData() {
  return JSON.parse(fs.readFileSync(dataPath));
}

// Write JSON
function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Get all AIs with optional filters
app.get('/api/ais', (req, res) => {
  let { search, func, price, page, limit } = req.query;
  let data = readData();

  if (search) data = data.filter(ai => ai.name.toLowerCase().includes(search.toLowerCase()));
  if (func) data = data.filter(ai => ai.functions.includes(func));
  if (price && price !== 'all') data = data.filter(ai => ai.price === price);

  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 30;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;

  res.json({
    total: data.length,
    page: pageNum,
    ais: data.slice(start, end)
  });
});

// Add rating
app.post('/api/rate', (req, res) => {
  const { name, func, rating } = req.body;
  if (!name || !func || !rating) return res.status(400).json({ error: 'Missing fields' });

  let data = readData();
  let ai = data.find(a => a.name === name);
  if (!ai) return res.status(404).json({ error: 'AI not found' });

  if (!ai.ratings[func]) ai.ratings[func] = [];
  ai.ratings[func].push(rating);

  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));