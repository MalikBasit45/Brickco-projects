const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const CUSTOMERS_FILE = path.join(__dirname, '..', 'data', 'customers.json');
const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');

// Helper functions to read/write data
const readCustomersData = async () => {
  const data = await fs.readFile(CUSTOMERS_FILE, 'utf8');
  return JSON.parse(data);
};

const writeCustomersData = async (customers) => {
  await fs.writeFile(CUSTOMERS_FILE, JSON.stringify({ customers }, null, 2), 'utf8');
};

const readOrdersData = async () => {
  const data = await fs.readFile(ORDERS_FILE, 'utf8');
  return JSON.parse(data);
};

// Validate customer data
const validateCustomer = (customer) => {
  const errors = [];
  
  if (!customer.name || typeof customer.name !== 'string' || customer.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!customer.email || typeof customer.email !== 'string' || 
      !customer.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email address is required');
  }
  
  if (customer.phone && typeof customer.phone === 'string') {
    if (!customer.phone.match(/^\+?[\d\s-()]{10,}$/)) {
      errors.push('Phone number format is invalid');
    }
  }
  
  if (customer.address && typeof customer.address !== 'string') {
    errors.push('Address must be a string');
  }
  
  return errors;
};

// GET all customers
router.get('/', async (req, res) => {
  try {
    const { customers } = await readCustomersData();
    res.json(customers);
  } catch (error) {
    console.error('Error reading customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET customer by ID with orders
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customers } = await readCustomersData();
    const customer = customers.find(c => c.id === id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get customer's orders
    const { orders } = await readOrdersData();
    const customerOrders = orders.filter(o => o.customerId === id);
    
    res.json({
      ...customer,
      orders: customerOrders
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// POST new customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const newCustomer = {
      name,
      email,
      ...(phone && { phone }),
      ...(address && { address })
    };
    
    // Validate customer data
    const validationErrors = validateCustomer(newCustomer);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
    
    // Check for duplicate email
    const { customers } = await readCustomersData();
    if (customers.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email address already exists' });
    }
    
    // Generate new ID
    const newId = (Math.max(...customers.map(c => parseInt(c.id)), 0) + 1).toString();
    newCustomer.id = newId;
    
    // Add customer
    customers.push(newCustomer);
    await writeCustomersData(customers);
    
    res.status(201).json(customers);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PATCH update customer
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get current customers
    const { customers } = await readCustomersData();
    const customerIndex = customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Create updated customer object
    const updatedCustomer = {
      ...customers[customerIndex],
      ...updates
    };
    
    // Validate updated data
    const validationErrors = validateCustomer(updatedCustomer);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
    
    // Check for duplicate email if email is being changed
    if (updates.email && updates.email !== customers[customerIndex].email) {
      if (customers.some(c => c.id !== id && c.email.toLowerCase() === updates.email.toLowerCase())) {
        return res.status(400).json({ error: 'Email address already exists' });
      }
    }
    
    // Update customer
    customers[customerIndex] = updatedCustomer;
    await writeCustomersData(customers);
    
    // Return updated customer with orders
    const { orders } = await readOrdersData();
    const customerOrders = orders.filter(o => o.customerId === id);
    
    res.json({
      ...updatedCustomer,
      orders: customerOrders
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer has any orders
    const { orders } = await readOrdersData();
    const hasOrders = orders.some(order => order.customerId === id);
    
    if (hasOrders) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing orders. Please delete all orders first.' 
      });
    }
    
    // Get current customers
    const { customers } = await readCustomersData();
    const customerIndex = customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Remove customer
    customers.splice(customerIndex, 1);
    await writeCustomersData(customers);
    
    res.json(customers);
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router; 