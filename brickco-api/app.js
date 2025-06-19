const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dashboardRoutes = require('./routes/dashboard');
const bricksRoutes = require('./routes/bricks');
const ordersRoutes = require('./routes/orders');
const customersRoutes = require('./routes/customers');
const analyticsRoutes = require('./routes/analytics');
const spendsRoutes = require('./routes/spends');
const stockHistoryRoutes = require('./routes/stockHistory');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bricks', bricksRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/spends', spendsRoutes);
app.use('/api/stock-history', stockHistoryRoutes);
app.use('/api/cart', cartRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 