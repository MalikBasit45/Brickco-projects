const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const BRICKS_FILE = path.join(__dirname, '..', 'data', 'bricks.json');
const STOCK_HISTORY_FILE = path.join(__dirname, '..', 'data', 'stockHistory.json');

// Helper functions to read/write data
const readBricksData = async () => {
  const data = await fs.readFile(BRICKS_FILE, 'utf8');
  return JSON.parse(data);
};

const writeBricksData = async (bricks) => {
  await fs.writeFile(BRICKS_FILE, JSON.stringify({ bricks }, null, 2), 'utf8');
};

const readStockHistoryData = async () => {
  const data = await fs.readFile(STOCK_HISTORY_FILE, 'utf8');
  return JSON.parse(data);
};

const writeStockHistoryData = async (history) => {
  await fs.writeFile(STOCK_HISTORY_FILE, JSON.stringify({ history }, null, 2), 'utf8');
};

// Add stock history entry
const addStockHistoryEntry = async (brickId, type, quantity, source) => {
  const { history } = await readStockHistoryData();
  const entry = {
    id: Date.now().toString(),
    brickId,
    type,
    quantity,
    source,
    timestamp: new Date().toISOString()
  };
  history.push(entry);
  await writeStockHistoryData(history);
};

// GET all bricks
router.get('/', async (req, res) => {
  try {
    const { bricks } = await readBricksData();
    res.json(bricks);
  } catch (error) {
    console.error('Error fetching bricks:', error);
    res.status(500).json({ error: 'Failed to fetch bricks' });
  }
});

// GET single brick
router.get('/:id', async (req, res) => {
  try {
    const { bricks } = await readBricksData();
    const brick = bricks.find(b => b.id === req.params.id);
    
    if (!brick) {
      return res.status(404).json({ error: 'Brick not found' });
    }
    
    res.json(brick);
  } catch (error) {
    console.error('Error fetching brick:', error);
    res.status(500).json({ error: 'Failed to fetch brick' });
  }
});

// POST new brick
router.post('/', async (req, res) => {
  try {
    const { bricks } = await readBricksData();
    const newBrick = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    bricks.push(newBrick);
    await writeBricksData(bricks);
    
    // Add stock history entry
    await addStockHistoryEntry(
      newBrick.id,
      'add',
      newBrick.stock,
      'initial_stock'
    );
    
    res.status(201).json(newBrick);
  } catch (error) {
    console.error('Error creating brick:', error);
    res.status(500).json({ error: 'Failed to create brick' });
  }
});

// PATCH update brick
router.patch('/:id', async (req, res) => {
  try {
    const { bricks } = await readBricksData();
    const index = bricks.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Brick not found' });
    }
    
    const oldStock = bricks[index].stock;
    const newStock = req.body.stock;
    
    // Update brick
    bricks[index] = {
      ...bricks[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await writeBricksData(bricks);
    
    // Add stock history entry if stock changed
    if (oldStock !== newStock) {
      await addStockHistoryEntry(
        req.params.id,
        newStock > oldStock ? 'add' : 'remove',
        Math.abs(newStock - oldStock),
        'manual_update'
      );
    }
    
    res.json(bricks[index]);
  } catch (error) {
    console.error('Error updating brick:', error);
    res.status(500).json({ error: 'Failed to update brick' });
  }
});

// DELETE brick
router.delete('/:id', async (req, res) => {
  try {
    const { bricks } = await readBricksData();
    const index = bricks.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Brick not found' });
    }
    
    const deletedBrick = bricks[index];
    bricks.splice(index, 1);
    await writeBricksData(bricks);
    
    // Add stock history entry
    await addStockHistoryEntry(
      req.params.id,
      'remove',
      deletedBrick.stock,
      'brick_deleted'
    );
    
    res.json({ message: 'Brick deleted successfully' });
  } catch (error) {
    console.error('Error deleting brick:', error);
    res.status(500).json({ error: 'Failed to delete brick' });
  }
});

// Validate stock availability
router.post('/validate-stock', async (req, res) => {
  try {
    const { items } = req.body;
    const { bricks } = await readBricksData();
    const invalidItems = [];

    for (const item of items) {
      const brick = bricks.find(b => b.id === item.brickId);
      if (!brick || brick.stock < item.quantity) {
        invalidItems.push({
          brickId: item.brickId,
          requested: item.quantity,
          available: brick ? brick.stock : 0
        });
      }
    }

    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock',
        invalidItems
      });
    }

    res.json({ message: 'Stock available' });
  } catch (error) {
    console.error('Error validating stock:', error);
    res.status(500).json({ error: 'Failed to validate stock' });
  }
});

// Update stock for multiple bricks
router.post('/update-stock', async (req, res) => {
  try {
    const { updates } = req.body;
    const { bricks } = await readBricksData();

    for (const update of updates) {
      const brick = bricks.find(b => b.id === update.brickId);
      if (brick) {
        const oldStock = brick.stock;
        brick.stock = Math.max(0, brick.stock + update.quantity);
        brick.updatedAt = new Date().toISOString();

        // Add stock history entry
        await addStockHistoryEntry(
          update.brickId,
          update.quantity > 0 ? 'add' : 'remove',
          Math.abs(update.quantity),
          update.source || 'bulk_update'
        );
      }
    }

    await writeBricksData(bricks);
    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

module.exports = router; 