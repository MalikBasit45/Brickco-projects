const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');
const CUSTOMERS_FILE = path.join(__dirname, '..', 'data', 'customers.json');
const BRICKS_FILE = path.join(__dirname, '..', 'data', 'bricks.json');
const STOCK_HISTORY_FILE = path.join(__dirname, '..', 'data', 'stockHistory.json');

// Helper functions to read/write data
const readOrdersData = async () => {
  const data = await fs.readFile(ORDERS_FILE, 'utf8');
  return JSON.parse(data);
};

const writeOrdersData = async (orders) => {
  await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders }, null, 2), 'utf8');
};

const readCustomersData = async () => {
  const data = await fs.readFile(CUSTOMERS_FILE, 'utf8');
  return JSON.parse(data);
};

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

const writeStockHistoryData = async (data) => {
  await fs.writeFile(STOCK_HISTORY_FILE, JSON.stringify(data, null, 2));
};

// Helper function to enrich orders with customer and brick data
const enrichOrdersWithData = async (orders) => {
  const { customers } = await readCustomersData();
  const { bricks } = await readBricksData();
  
  return orders.map(order => ({
    ...order,
    customerName: customers.find(c => c.id === order.customerId)?.name || 'Unknown Customer',
    brickName: bricks.find(b => b.id === order.brickId)?.name || 'Unknown Brick'
  }));
};

// Helper function to update brick stock
const updateBrickStock = async (brickId, quantity, isIncrease) => {
  const { bricks } = await readBricksData();
  const brickIndex = bricks.findIndex(b => b.id === brickId);
  
  if (brickIndex === -1) {
    throw new Error('Brick not found');
  }

  const brick = bricks[brickIndex];
  bricks[brickIndex] = {
    ...brick,
    stock: isIncrease ? brick.stock + quantity : brick.stock - quantity
  };

  await writeBricksData(bricks);
};

// Helper function to add stock history entry
const addStockHistoryEntry = async (brickId, brickName, quantity, type, source) => {
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
};

// GET all orders
router.get('/', async (req, res) => {
  try {
    const { orders } = await readOrdersData();
    const enrichedOrders = await enrichOrdersWithData(orders);
    
    // Sort by date descending
    enrichedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error reading orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET all customers (for order creation)
router.get('/customers', async (req, res) => {
  try {
    const { customers } = await readCustomersData();
    res.json(customers);
  } catch (error) {
    console.error('Error reading customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET all bricks (for order creation)
router.get('/bricks', async (req, res) => {
  try {
    const { bricks } = await readBricksData();
    res.json(bricks);
  } catch (error) {
    console.error('Error reading bricks:', error);
    res.status(500).json({ error: 'Failed to fetch bricks' });
  }
});

// GET orders for specific customer
router.get('/customer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { orders } = await readOrdersData();
    
    // Filter orders for this customer
    const customerOrders = orders.filter(o => o.customerId === id);
    
    // Return enriched orders
    const enrichedOrders = await enrichOrdersWithData(customerOrders);
    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// POST new order
router.post('/', async (req, res) => {
  try {
    const { customerId, brickId, quantity } = req.body;

    // Validate required fields
    if (!customerId || !brickId || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate numeric fields
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Validate customer exists
    const { customers } = await readCustomersData();
    const customerExists = customers.some(c => c.id === customerId);
    if (!customerExists) {
      return res.status(400).json({ error: 'Invalid customer' });
    }

    // Validate brick exists and calculate amount
    const { bricks } = await readBricksData();
    const brick = bricks.find(b => b.id === brickId);
    if (!brick) {
      return res.status(400).json({ error: 'Invalid brick' });
    }

    const amount = quantity * brick.price;

    const { orders } = await readOrdersData();
    
    // Generate new ID (simple increment for demo)
    const newId = (Math.max(...orders.map(o => parseInt(o.id)), 0) + 1).toString();
    
    const newOrder = {
      id: newId,
      customerId,
      brickId,
      quantity: parseInt(quantity),
      amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    await writeOrdersData(orders);

    // Return enriched orders list
    const enrichedOrders = await enrichOrdersWithData(orders);
    res.status(201).json(enrichedOrders);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH update order status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['pending', 'processing', 'done', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { orders } = await readOrdersData();
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];

    // If marking as done, check and update brick stock
    if (status === 'done' && order.status !== 'done') {
      const { bricks } = await readBricksData();
      const brickIndex = bricks.findIndex(b => b.id === order.brickId);
      
      if (brickIndex === -1) {
        return res.status(400).json({ error: 'Brick not found' });
      }

      const brick = bricks[brickIndex];

      // Check if enough stock
      if (brick.stock < order.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock. Available: ${brick.stock}, Required: ${order.quantity}` 
        });
      }

      // Update brick stock
      await updateBrickStock(order.brickId, order.quantity, false);

      // Add stock history entry
      await addStockHistoryEntry(brick.id, brick.name, order.quantity, 'deducted', 'order');
    }

    // Update order status
    orders[orderIndex] = {
      ...order,
      status
    };

    await writeOrdersData(orders);
    
    // Return enriched orders list
    const enrichedOrders = await enrichOrdersWithData(orders);
    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// PATCH cancel order
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { restoreStock } = req.body;

    const { orders } = await readOrdersData();
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];

    // Can't cancel an already cancelled order
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    // If order was done and we want to restore stock
    if (order.status === 'done' && restoreStock) {
      try {
        await updateBrickStock(order.brickId, order.quantity, true);
        await addStockHistoryEntry(order.brickId, order.brickName, order.quantity, 'added', 'order');
      } catch (error) {
        return res.status(400).json({ error: 'Failed to restore brick stock' });
      }
    }

    // Update order status to cancelled
    orders[orderIndex] = {
      ...order,
      status: 'cancelled'
    };

    await writeOrdersData(orders);
    
    // Return enriched orders list
    const enrichedOrders = await enrichOrdersWithData(orders);
    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { restoreStock } = req.body;

    const { orders } = await readOrdersData();
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];

    // If order was done and we want to restore stock
    if (order.status === 'done' && restoreStock) {
      try {
        await updateBrickStock(order.brickId, order.quantity, true);
        await addStockHistoryEntry(order.brickId, order.brickName, order.quantity, 'added', 'order');
      } catch (error) {
        return res.status(400).json({ error: 'Failed to restore brick stock' });
      }
    }

    // Remove order
    orders.splice(orderIndex, 1);
    await writeOrdersData(orders);
    
    // Return enriched orders list
    const enrichedOrders = await enrichOrdersWithData(orders);
    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router; 