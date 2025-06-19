/*
  # Initial Schema Setup

  1. New Tables
    - users (extends Supabase auth.users)
      - id (uuid, references auth.users)
      - full_name (text)
      - role (text)
      - created_at (timestamp)
    
    - bricks
      - id (uuid)
      - name (text)
      - type (text)
      - size (text)
      - color (text)
      - price (decimal)
      - stock (integer)
      - image_url (text)
      - description (text)
      - featured (boolean)
      - created_at (timestamp)
    
    - orders
      - id (uuid)
      - user_id (uuid, references users)
      - status (text)
      - total_amount (decimal)
      - shipping_address (jsonb)
      - tracking_number (text)
      - created_at (timestamp)
    
    - order_items
      - id (uuid)
      - order_id (uuid, references orders)
      - brick_id (uuid, references bricks)
      - quantity (integer)
      - price (decimal)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
*/

-- Create users table to extend auth.users
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  full_name text,
  role text CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create bricks table
CREATE TABLE bricks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  size text NOT NULL,
  color text NOT NULL,
  price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  description text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bricks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bricks"
  ON bricks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can modify bricks"
  ON bricks
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users NOT NULL,
  status text CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')) DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  tracking_number text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can modify orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create order_items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders NOT NULL,
  brick_id uuid REFERENCES bricks NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admin can read all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create indexes for better query performance
CREATE INDEX idx_bricks_featured ON bricks(featured) WHERE featured = true;
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_brick_id ON order_items(brick_id);