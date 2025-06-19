import { Brick, Order, Testimonial, Stats, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    email: 'admin@brickco.com',
  },
  {
    id: '2',
    username: 'customer',
    role: 'customer',
    email: 'customer@example.com',
  },
];

export const mockBricks: Brick[] = [
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
  {
    id: '3',
    name: 'Charcoal Sleek',
    type: 'Clay',
    size: 'Standard',
    color: 'Dark Gray',
    price: 0.95,
    stock: 8000,
    image: 'https://images.pexels.com/photos/2923577/pexels-photo-2923577.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Modern charcoal colored brick that adds sophistication to any project.',
    featured: false,
  },
  {
    id: '4',
    name: 'Rustic Red',
    type: 'Clay',
    size: 'Standard',
    color: 'Red',
    price: 0.85,
    stock: 7500,
    image: 'https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Rustic textured red brick with an authentic aged appearance.',
    featured: true,
  },
  {
    id: '5',
    name: 'White Facade',
    type: 'Concrete',
    size: 'Small',
    color: 'White',
    price: 1.05,
    stock: 6000,
    image: 'https://images.pexels.com/photos/2506990/pexels-photo-2506990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Clean white brick perfect for contemporary designs and accent walls.',
    featured: false,
  },
  {
    id: '6',
    name: 'Industrial Black',
    type: 'Clay',
    size: 'Large',
    color: 'Black',
    price: 1.35,
    stock: 4500,
    image: 'https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    description: 'Bold black brick for industrial-inspired designs and statement walls.',
    featured: true,
  },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    customerId: '2',
    items: [
      { brickId: '1', brickName: 'Classic Red Brick', quantity: 1000, price: 750 },
      { brickId: '4', brickName: 'Rustic Red', quantity: 500, price: 425 },
    ],
    totalAmount: 1175,
    status: 'shipped',
    createdAt: '2025-05-15T10:30:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'Brickville',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    trackingNumber: 'BRK123456789',
  },
  {
    id: '2',
    customerId: '2',
    items: [
      { brickId: '2', brickName: 'Sandstone Brick', quantity: 2000, price: 2500 },
    ],
    totalAmount: 2500,
    status: 'processing',
    createdAt: '2025-05-18T14:45:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'Brickville',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
  },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    customerName: 'John Smith',
    company: 'Smith Construction',
    text: 'The quality of BrickCo\'s products is unmatched. We\'ve been using their bricks for all our projects for the past 5 years.',
    rating: 5,
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    company: 'Johnson Architects',
    text: 'BrickCo delivered our order on time, even with our tight deadline. The Sandstone Bricks were exactly what we needed for our client\'s project.',
    rating: 5,
    image: 'https://images.pexels.com/photos/3757004/pexels-photo-3757004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '3',
    customerName: 'Michael Brown',
    company: 'Brown Building Co.',
    text: 'We appreciate the consistent quality and competitive pricing. BrickCo has been our go-to supplier for years.',
    rating: 4,
    image: 'https://images.pexels.com/photos/2117252/pexels-photo-2117252.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];

export const mockStats: Stats = {
  totalBricksSupplied: 10000000,
  activeProjects: 250,
  customersSatisfied: 1500,
  yearsInBusiness: 35,
};