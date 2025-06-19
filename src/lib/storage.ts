import { Brick, Order, User, CartItem } from '../types';

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'brickco_users',
  BRICKS: 'brickco_bricks',
  ORDERS: 'brickco_orders',
  CART: 'brickco_cart',
  AUTH: 'brickco_auth',
};

// Helper functions for localStorage
const getItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// User management
export const getUsers = (): User[] => {
  return getItem(STORAGE_KEYS.USERS) || [];
};

export const createUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  setItem(STORAGE_KEYS.USERS, users);
};

export const updateUser = (updatedUser: User): void => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    setItem(STORAGE_KEYS.USERS, users);
  }
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

// Authentication
export const getCurrentUser = (): User | null => {
  return getItem(STORAGE_KEYS.AUTH);
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    setItem(STORAGE_KEYS.AUTH, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};

// Brick management
export const getBricks = (): Brick[] => {
  return getItem(STORAGE_KEYS.BRICKS) || [];
};

export const createBrick = (brick: Brick): void => {
  const bricks = getBricks();
  bricks.push(brick);
  setItem(STORAGE_KEYS.BRICKS, bricks);
};

export const updateBrick = (updatedBrick: Brick): void => {
  const bricks = getBricks();
  const index = bricks.findIndex(brick => brick.id === updatedBrick.id);
  if (index !== -1) {
    bricks[index] = updatedBrick;
    setItem(STORAGE_KEYS.BRICKS, bricks);
  }
};

export const deleteBrick = (id: string): void => {
  const bricks = getBricks();
  const filteredBricks = bricks.filter(brick => brick.id !== id);
  setItem(STORAGE_KEYS.BRICKS, filteredBricks);
};

// Order management
export const getOrders = (): Order[] => {
  return getItem(STORAGE_KEYS.ORDERS) || [];
};

export const createOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  setItem(STORAGE_KEYS.ORDERS, orders);
  
  // Update brick stock
  order.items.forEach(item => {
    const brick = getBrickById(item.brickId);
    if (brick) {
      updateBrick({
        ...brick,
        stock: brick.stock - item.quantity
      });
    }
  });
};

export const getBrickById = (id: string): Brick | null => {
  const bricks = getBricks();
  return bricks.find(brick => brick.id === id) || null;
};

export const getOrdersByUserId = (userId: string): Order[] => {
  const orders = getOrders();
  return orders.filter(order => order.customerId === userId);
};

export const updateOrderStatus = (orderId: string, status: Order['status']): void => {
  const orders = getOrders();
  const index = orders.findIndex(order => order.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    setItem(STORAGE_KEYS.ORDERS, orders);
  }
};

// Cart management
export const getCart = (): CartItem[] => {
  return getItem(STORAGE_KEYS.CART) || [];
};

export const updateCart = (items: CartItem[]): void => {
  setItem(STORAGE_KEYS.CART, items);
};

// Initialize demo data
export const initializeDemoData = (): void => {
  // Only initialize if no data exists
  if (!getUsers().length) {
    // Create demo admin user
    createUser({
      id: '1',
      username: 'admin',
      email: 'admin@brickco.com',
      role: 'admin',
    });

    // Create demo customer
    createUser({
      id: '2',
      username: 'customer',
      email: 'customer@example.com',
      role: 'customer',
    });

    // Initialize bricks from mock data
    setItem(STORAGE_KEYS.BRICKS, [
      {
        id: '1',
        name: 'Classic Red Brick',
        type: 'Clay',
        size: 'Standard',
        color: 'Red',
        price: 0.75,
        stock: 10000,
        image: 'https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        description: 'Our classic red clay brick, perfect for traditional builds and renovations.',
        featured: true,
      },
      {
        id: '2',
        name: 'Sandstone Brick',
        type: 'Concrete',
        size: 'Large',
        color: 'Sand',
        price: 1.25,
        stock: 5000,
        image: 'https://images.pexels.com/photos/2523609/pexels-photo-2523609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        description: 'Elegant sandstone colored brick, ideal for modern buildings and decorative facades.',
        featured: true,
      },
      // Add more demo bricks as needed
    ]);
  }
};