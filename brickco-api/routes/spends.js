const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const SPENDS_FILE = path.join(__dirname, '..', 'data', 'spends.json');

// Helper function to read spends data
const readSpendsData = async () => {
  const data = await fs.readFile(SPENDS_FILE, 'utf8');
  return JSON.parse(data);
};

// Helper function to write spends data
const writeSpendsData = async (data) => {
  await fs.writeFile(SPENDS_FILE, JSON.stringify(data, null, 2));
};

// GET all spends
router.get('/', async (req, res) => {
  try {
    const data = await readSpendsData();
    res.json(data.spends);
  } catch (error) {
    console.error('Error reading spends:', error);
    res.status(500).json({ error: 'Failed to fetch spends' });
  }
});

// POST new spend
router.post('/', async (req, res) => {
  try {
    const { labour, clay, coal, transport, other, month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const total = (labour || 0) + (clay || 0) + (coal || 0) + (transport || 0) + (other || 0);
    
    const data = await readSpendsData();
    const newSpend = {
      id: Date.now().toString(),
      labour: labour || 0,
      clay: clay || 0,
      coal: coal || 0,
      transport: transport || 0,
      other: other || 0,
      month,
      year,
      total,
      createdAt: new Date().toISOString()
    };

    // Check if spend for this month/year already exists
    const existingIndex = data.spends.findIndex(s => s.month === month && s.year === year);
    if (existingIndex !== -1) {
      data.spends[existingIndex] = {
        ...data.spends[existingIndex],
        ...newSpend,
        id: data.spends[existingIndex].id
      };
    } else {
      data.spends.push(newSpend);
    }

    await writeSpendsData(data);
    res.status(201).json(newSpend);
  } catch (error) {
    console.error('Error creating spend:', error);
    res.status(500).json({ error: 'Failed to create spend' });
  }
});

// GET spend by month/year
router.get('/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const data = await readSpendsData();
    const spend = data.spends.find(s => s.year === year && s.month === month);
    
    if (!spend) {
      return res.status(404).json({ error: 'Spend not found' });
    }
    
    res.json(spend);
  } catch (error) {
    console.error('Error fetching spend:', error);
    res.status(500).json({ error: 'Failed to fetch spend' });
  }
});

module.exports = router; 