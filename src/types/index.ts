export interface User {
  id: string;
  username: string;
  role: 'admin' | 'customer';
  email: string;
}

export interface Brick {
  id: string;
  name: string;
  type: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  featured: boolean;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  manufacturer: string;
  sku: string;
  minStockThreshold: number;
  storageLocation: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  shippingAddress: Address;
  trackingNumber?: string;
}

export interface OrderItem {
  brickId: string;
  brickName: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartItem {
  brick: Brick;
  quantity: number;
}

export interface Testimonial {
  id: string;
  customerName: string;
  company?: string;
  text: string;
  rating: number;
  image?: string;
}

export interface Stats {
  totalBricksSupplied: number;
  activeProjects: number;
  customersSatisfied: number;
  yearsInBusiness: number;
}

export interface Spend {
  id: string;
  amount: number;
  date: string;
  category: SpendCategory;
  description: string;
  paymentMethod: PaymentMethod;
  status: SpendStatus;
}

export type SpendCategory = 
  | 'inventory'
  | 'marketing'
  | 'operations'
  | 'payroll'
  | 'utilities'
  | 'maintenance'
  | 'other';

export type PaymentMethod = 
  | 'credit_card'
  | 'bank_transfer'
  | 'cash'
  | 'check'
  | 'other';

export type SpendStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed';

export type MaterialType = 
  | 'Clay'
  | 'Concrete'
  | 'Glass'
  | 'Special';