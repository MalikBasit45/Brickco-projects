const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const CARTS_FILE = path.join(__dirname, '..', 'data', 'carts.json');
const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');
const BRICKS_FILE = path.join(__dirname, '..', 'data', 'bricks.json');
const STOCK_HISTORY_FILE = path.join(__dirname, '..', 'data', 'stockHistory.json');

// Helper functions to read/write data
const readCartsData = async () => {
  try {
    const data = await fs.readFile(CARTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with empty carts
    if (error.code === 'ENOENT') {
      const initialData = { carts: {} };
      await fs.writeFile(CARTS_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    throw error;
  }
};

const writeCartsData = async (carts) => {
  await fs.writeFile(CARTS_FILE, JSON.stringify({ carts }, null, 2), 'utf8');
};

const readOrdersData = async () => {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const initialData = { orders: [] };
      await fs.writeFile(ORDERS_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    throw error;
  }
};

const writeOrdersData = async (orders) => {
  await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders }, null, 2), 'utf8');
};

const readBricksData = async () => {
  const data = await fs.readFile(BRICKS_FILE, 'utf8');
  return JSON.parse(data);
};

const writeBricksData = async (bricks) => {
  await fs.writeFile(BRICKS_FILE, JSON.stringify({ bricks }, null, 2), 'utf8');
};

const addStockHistoryEntry = async (brickId, type, quantity, source) => {
  try {
    const data = await fs.readFile(STOCK_HISTORY_FILE, 'utf8');
    const { history } = JSON.parse(data);
    const entry = {
      id: Date.now().toString(),
      brickId,
      type,
      quantity,
      source,
      timestamp: new Date().toISOString()
    };
    history.push(entry);
    await fs.writeFile(STOCK_HISTORY_FILE, JSON.stringify({ history }, null, 2), 'utf8');
  } catch (error) {
    console.error('Error adding stock history entry:', error);
  }
};

// GET cart for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { carts } = await readCartsData();
    const { bricks } = await readBricksData();

    // Get or initialize cart
    const cart = carts[userId] || { items: [], updatedAt: new Date().toISOString() };

    // Enrich cart items with current brick data
    const enrichedItems = cart.items.map(item => {
      const brick = bricks.find(b => b.id === item.brickId);
      return {
        ...item,
        name: brick?.name,
        price: brick?.price,
        currentStock: brick?.stock
      };
    });

    res.json({
      ...cart,
      items: enrichedItems
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, brickId, quantity } = req.body;

    if (!userId || !brickId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { bricks } = await readBricksData();
    const brick = bricks.find(b => b.id === brickId);

    if (!brick) {
      return res.status(404).json({ error: 'Brick not found' });
    }

    if (brick.stock < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        available: brick.stock
      });
    }

    const { carts } = await readCartsData();
    const cart = carts[userId] || { items: [], updatedAt: new Date().toISOString() };

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.brickId === brickId);

    if (existingItemIndex !== -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > brick.stock) {
        return res.status(400).json({
          error: 'Insufficient stock',
          available: brick.stock
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        brickId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }

    cart.updatedAt = new Date().toISOString();
    carts[userId] = cart;
    await writeCartsData(carts);

    // Return enriched cart
    const enrichedItems = cart.items.map(item => {
      const b = bricks.find(b => b.id === item.brickId);
      return {
        ...item,
        name: b?.name,
        price: b?.price,
        currentStock: b?.stock
      };
    });

    res.json({
      ...cart,
      items: enrichedItems
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const { userId, brickId } = req.body;

    if (!userId || !brickId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { carts } = await readCartsData();
    const cart = carts[userId];

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.brickId !== brickId);
    cart.updatedAt = new Date().toISOString();
    carts[userId] = cart;
    await writeCartsData(carts);

    // Return enriched cart
    const { bricks } = await readBricksData();
    const enrichedItems = cart.items.map(item => {
      const brick = bricks.find(b => b.id === item.brickId);
      return {
        ...item,
        name: brick?.name,
        price: brick?.price,
        currentStock: brick?.stock
      };
    });

    res.json({
      ...cart,
      items: enrichedItems
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Checkout cart
router.post('/checkout', async (req, res) => {
  try {
    const { userId, customerInfo } = req.body;

    if (!userId || !customerInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { carts } = await readCartsData();
    const cart = carts[userId];

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock and calculate total
    const { bricks } = await readBricksData();
    let total = 0;
    const updates = [];
    const orderItems = [];

    for (const item of cart.items) {
      const brick = bricks.find(b => b.id === item.brickId);
      if (!brick || brick.stock < item.quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          brickId: item.brickId,
          requested: item.quantity,
          available: brick ? brick.stock : 0
        });
      }

      // Update stock
      brick.stock -= item.quantity;
      updates.push({
        brickId: brick.id,
        quantity: -item.quantity
      });

      // Calculate item total
      const itemTotal = brick.price * item.quantity;
      total += itemTotal;

      // Prepare order item
      orderItems.push({
        brickId: brick.id,
        name: brick.name,
        quantity: item.quantity,
        price: brick.price,
        total: itemTotal
      });
    }

    // Create order
    const { orders } = await readOrdersData();
    const order = {
      id: Date.now().toString(),
      customerId: userId,
      customerInfo,
      items: orderItems,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.push(order);

    // Update stock and history
    for (const update of updates) {
      await addStockHistoryEntry(
        update.brickId,
        'remove',
        Math.abs(update.quantity),
        'order'
      );
    }

    // Save all changes
    await writeBricksData(bricks);
    await writeOrdersData(orders);

    // Clear cart
    delete carts[userId];
    await writeCartsData(carts);

    res.json({
      orderId: order.id,
      total: order.total
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ error: 'Failed to process checkout' });
  }
});

module.exports = router; 