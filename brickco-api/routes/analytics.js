const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { Parser } = require('json2csv');

const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');
const CUSTOMERS_FILE = path.join(__dirname, '..', 'data', 'customers.json');
const BRICKS_FILE = path.join(__dirname, '..', 'data', 'bricks.json');
const SPENDS_FILE = path.join(__dirname, '..', 'data', 'spends.json');
const STOCK_HISTORY_FILE = path.join(__dirname, '..', 'data', 'stockHistory.json');

// Helper functions to read data
const readOrdersData = async () => {
  const data = await fs.readFile(ORDERS_FILE, 'utf8');
  return JSON.parse(data);
};

const readCustomersData = async () => {
  const data = await fs.readFile(CUSTOMERS_FILE, 'utf8');
  return JSON.parse(data);
};

const readBricksData = async () => {
  const data = await fs.readFile(BRICKS_FILE, 'utf8');
  return JSON.parse(data);
};

const readSpendsData = async () => {
  const data = await fs.readFile(SPENDS_FILE, 'utf8');
  return JSON.parse(data);
};

const readStockHistoryData = async () => {
  const data = await fs.readFile(STOCK_HISTORY_FILE, 'utf8');
  return JSON.parse(data);
};

// Helper function to generate monthly trends with spends
const generateMonthlyTrends = async (orders) => {
  const monthlyData = {};
  const { spends } = await readSpendsData();
  
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        revenue: 0,
        orderCount: 0,
        expenses: 0,
        netRevenue: 0
      };
    }
    
    if (order.status !== 'cancelled') {
      monthlyData[monthKey].revenue += order.amount;
      monthlyData[monthKey].orderCount += 1;
    }
  });
  
  // Add spends data
  spends.forEach(spend => {
    const monthKey = `${spend.year}-${String(spend.month).padStart(2, '0')}`;
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].expenses = spend.total;
      monthlyData[monthKey].netRevenue = monthlyData[monthKey].revenue - spend.total;
    }
  });
  
  // Convert to array and sort by month
  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

// GET monthly trends
router.get('/trends', async (req, res) => {
  try {
    const { orders } = await readOrdersData();
    const trends = await generateMonthlyTrends(orders);
    
    res.json({
      monthlyRevenueTrend: trends.map(t => ({ month: t.month, value: t.netRevenue })),
      monthlyOrdersTrend: trends.map(t => ({ month: t.month, value: t.orderCount }))
    });
  } catch (error) {
    console.error('Error generating trends:', error);
    res.status(500).json({ error: 'Failed to generate trends' });
  }
});

// GET orders report
router.get('/orders', async (req, res) => {
  try {
    const { orders } = await readOrdersData();
    const { customers } = await readCustomersData();
    const { bricks } = await readBricksData();
    
    // Enrich orders with customer and brick data
    const enrichedOrders = orders.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      const brick = bricks.find(b => b.id === order.brickId);
      
      return {
        orderId: order.id,
        customerName: customer?.name || 'Unknown',
        customerEmail: customer?.email || 'Unknown',
        brickName: brick?.name || 'Unknown',
        quantity: order.quantity,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt
      };
    });
    
    if (req.query.format === 'csv') {
      const fields = ['orderId', 'customerName', 'customerEmail', 'brickName', 'quantity', 'amount', 'status', 'createdAt'];
      const parser = new Parser({ fields });
      const csv = parser.parse(enrichedOrders);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders-report.csv');
      return res.send(csv);
    }
    
    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error generating orders report:', error);
    res.status(500).json({ error: 'Failed to generate orders report' });
  }
});

// GET customers report
router.get('/customers', async (req, res) => {
  try {
    const { customers } = await readCustomersData();
    const { orders } = await readOrdersData();
    
    // Enrich customers with order statistics
    const enrichedCustomers = customers.map(customer => {
      const customerOrders = orders.filter(o => o.customerId === customer.id);
      const activeOrders = customerOrders.filter(o => o.status !== 'cancelled');
      
      return {
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || 'N/A',
        address: customer.address || 'N/A',
        totalOrders: customerOrders.length,
        activeOrders: activeOrders.length,
        totalSpent: activeOrders.reduce((sum, o) => sum + o.amount, 0)
      };
    });
    
    if (req.query.format === 'csv') {
      const fields = ['customerId', 'name', 'email', 'phone', 'address', 'totalOrders', 'activeOrders', 'totalSpent'];
      const parser = new Parser({ fields });
      const csv = parser.parse(enrichedCustomers);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers-report.csv');
      return res.send(csv);
    }
    
    res.json(enrichedCustomers);
  } catch (error) {
    console.error('Error generating customers report:', error);
    res.status(500).json({ error: 'Failed to generate customers report' });
  }
});

// GET revenue report
router.get('/revenue', async (req, res) => {
  try {
    const { orders } = await readOrdersData();
    const trends = await generateMonthlyTrends(orders);
    
    const revenueData = trends.map(t => ({
      month: t.month,
      revenue: t.revenue,
      expenses: t.expenses,
      netRevenue: t.netRevenue,
      orderCount: t.orderCount,
      averageOrderValue: t.orderCount > 0 ? t.revenue / t.orderCount : 0
    }));
    
    if (req.query.format === 'csv') {
      const fields = ['month', 'revenue', 'expenses', 'netRevenue', 'orderCount', 'averageOrderValue'];
      const parser = new Parser({ fields });
      const csv = parser.parse(revenueData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.csv');
      return res.send(csv);
    }
    
    res.json(revenueData);
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ error: 'Failed to generate revenue report' });
  }
});

// GET spends report
router.get('/spends', async (req, res) => {
  try {
    const { spends } = await readSpendsData();
    
    if (req.query.format === 'csv') {
      const fields = ['id', 'labour', 'clay', 'coal', 'transport', 'other', 'month', 'year', 'total', 'createdAt'];
      const parser = new Parser({ fields });
      const csv = parser.parse(spends);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=spends-report.csv');
      return res.send(csv);
    }
    
    res.json(spends);
  } catch (error) {
    console.error('Error generating spends report:', error);
    res.status(500).json({ error: 'Failed to generate spends report' });
  }
});

// GET stock history report
router.get('/stock-history', async (req, res) => {
  try {
    const { history } = await readStockHistoryData();
    
    if (req.query.format === 'csv') {
      const fields = ['id', 'brickId', 'brickName', 'quantity', 'type', 'source', 'timestamp'];
      const parser = new Parser({ fields });
      const csv = parser.parse(history);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=stock-history-report.csv');
      return res.send(csv);
    }
    
    res.json(history);
  } catch (error) {
    console.error('Error generating stock history report:', error);
    res.status(500).json({ error: 'Failed to generate stock history report' });
  }
});

module.exports = router; 