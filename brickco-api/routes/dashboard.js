const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Helper function to read JSON files
const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, '..', 'data', filename);
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};

// Helper function to calculate monthly trends
const calculateMonthlyTrends = (orders, months = 6) => {
  const now = new Date();
  const trends = [];
  
  for (let i = 0; i < months; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= month && orderDate <= monthEnd && order.status === 'done';
    });
    
    trends.unshift({
      month: month.toLocaleString('default', { month: 'short', year: '2-digit' }),
      orders: monthlyOrders.length,
      revenue: monthlyOrders.reduce((sum, order) => sum + order.amount, 0)
    });
  }
  
  return trends;
};

router.get('/metrics', (req, res) => {
  try {
    // Read data from JSON files
    const { bricks } = readJsonFile('bricks.json');
    const { orders } = readJsonFile('orders.json');
    const { customers } = readJsonFile('customers.json');
    
    // Calculate metrics
    const totalStock = bricks.reduce((sum, brick) => sum + brick.stock, 0);
    const lowStockCount = bricks.filter(brick => brick.stock < brick.minStockThreshold).length;
    
    const completedOrders = orders.filter(order => order.status === 'done');
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
    
    // Get recent orders with customer details
    const recentOrders = orders
      .filter(order => order.status === 'done')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        ...order,
        customer: customers.find(c => c.id === order.customerId)?.name || 'Unknown Customer'
      }));
    
    // Calculate monthly trends
    const trends = calculateMonthlyTrends(orders);
    
    res.json({
      totalStock,
      lowStockCount,
      totalOrders,
      totalRevenue,
      recentOrders,
      monthlyOrdersTrend: trends.map(t => ({ month: t.month, orders: t.orders })),
      monthlyRevenueTrend: trends.map(t => ({ month: t.month, revenue: t.revenue }))
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

module.exports = router; 