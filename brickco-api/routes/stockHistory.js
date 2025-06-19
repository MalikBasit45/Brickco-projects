const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const STOCK_HISTORY_FILE = path.join(__dirname, '..', 'data', 'stockHistory.json');

// Helper function to read stock history data
const readStockHistoryData = async () => {
  const data = await fs.readFile(STOCK_HISTORY_FILE, 'utf8');
  return JSON.parse(data);
};

// Helper function to write stock history data
const writeStockHistoryData = async (data) => {
  await fs.writeFile(STOCK_HISTORY_FILE, JSON.stringify(data, null, 2));
};

// GET stock history
router.get('/', async (req, res) => {
  try {
    const data = await readStockHistoryData();
    const { type, source } = req.query;
    
    let filteredHistory = data.history;
    
    if (type) {
      filteredHistory = filteredHistory.filter(h => h.type === type);
    }
    
    if (source) {
      filteredHistory = filteredHistory.filter(h => h.source === source);
    }
    
    res.json(filteredHistory);
  } catch (error) {
    console.error('Error reading stock history:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

// POST new stock history entry
router.post('/', async (req, res) => {
  try {
    const { brickId, brickName, quantity, type, source } = req.body;
    
    if (!brickId || !brickName || !quantity || !type || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['added', 'deducted'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be "added" or "deducted"' });
    }
    
    if (!['inventory', 'order'].includes(source)) {
      return res.status(400).json({ error: 'Invalid source. Must be "inventory" or "order"' });
    }
    
    const data = await readStockHistoryData();
    const newEntry = {
      id: Date.now().toString(),
      brickId,
      brickName,
      quantity,
      type,
      source,
      timestamp: new Date().toISOString()
    };
    
    data.history.push(newEntry);
    await writeStockHistoryData(data);
    
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating stock history entry:', error);
    res.status(500).json({ error: 'Failed to create stock history entry' });
  }
});

module.exports = router; 