-- TikTok Shop Clone - Supabase Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usercode VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  avatar VARCHAR(10) DEFAULT '1',
  role VARCHAR(20) DEFAULT 'MEMBER',
  kyc_status INT DEFAULT 0,
  identityverif BOOLEAN DEFAULT false,
  googleverif BOOLEAN DEFAULT false,
  lastloginip VARCHAR(45),
  lastlogintime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo VARCHAR(255),
  goods_count INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  is_recommended BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goods_id VARCHAR(50) UNIQUE NOT NULL,
  seller_id UUID REFERENCES sellers(id),
  category_id UUID REFERENCES categories(id),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  images JSONB DEFAULT '[]',
  specs JSONB DEFAULT '{}',
  stock INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  is_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES sellers(id),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  shipping_address JSONB,
  tracking_no VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(500),
  product_price DECIMAL(10,2),
  quantity INT DEFAULT 1,
  total_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  contacts VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(255),
  address TEXT NOT NULL,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Indonesia',
  postcode VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  balance DECIMAL(12,2) DEFAULT 0,
  rebate DECIMAL(12,2) DEFAULT 0,
  frozen_money DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES sellers(id),
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Followed sellers table
CREATE TABLE IF NOT EXISTS followed_sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES sellers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, seller_id)
);

-- Blockchain channels table
CREATE TABLE IF NOT EXISTS blockchain_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coin VARCHAR(20) NOT NULL,
  blockchain_name VARCHAR(50) NOT NULL,
  address TEXT,
  fee DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255),
  image_url VARCHAR(500),
  link VARCHAR(500),
  type VARCHAR(20) DEFAULT 'pc',
  img_type INT DEFAULT 1,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System parameters table
CREATE TABLE IF NOT EXISTS system_params (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_receiver ON chat_messages(receiver_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE followed_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Sellers can view shop orders" ON orders FOR SELECT USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own chats" ON chat_messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own follows" ON followed_sellers FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());

-- Insert sample data
INSERT INTO categories (name, description, icon, color, sort_order) VALUES
('Food & Beverage', 'Food, drinks, and groceries', '🍎', '#fe2c55', 1),
('Men''s Clothing', 'Men''s fashion and apparel', '👔', '#4ecdc4', 2),
('Women''s Clothing', 'Women''s fashion and apparel', '👗', '#ff6b81', 3),
('Electronics', 'Gadgets and electronic devices', '📱', '#45b7d1', 4),
('Home Appliances', 'Home and kitchen appliances', '🏠', '#96ceb4', 5),
('Sports & Outdoors', 'Sports equipment and outdoor gear', '⚽', '#feca57', 6),
('Beauty & Health', 'Beauty products and health supplements', '💄', '#ff9ff3', 7),
('Kids & Toys', 'Children''s products and toys', '🧸', '#54a0ff', 8),
('Jewelry & Watches', 'Fine jewelry and timepieces', '💎', '#5f27cd', 9),
('Bags & Luggage', 'Bags, purses, and travel luggage', '👜', '#01a3a4', 10),
('Virtual Card', 'Digital and virtual products', '💳', '#2ed573', 11),
('Luxury', 'Premium luxury items', '✨', '#ffa502', 12);

INSERT INTO blockchain_channels (coin, blockchain_name, fee, is_active) VALUES
('USDT', 'TRC20', 1.00, true),
('USDT', 'ERC20', 1.00, true),
('USDC', 'ERC20', 1.00, true),
('BTC', 'Bitcoin', 0.50, true),
('ETH', 'Ethereum', 0.50, true);

INSERT INTO system_params (code, value, description) VALUES
('customer_service_url', '', 'Customer service chat URL'),
('mall_max_goods_number_in_order', '999', 'Max items per order'),
('seller_apply_url', '', 'Seller application URL'),
('recharge_url', '', 'Wallet recharge URL'),
('withdraw_url', '', 'Wallet withdraw URL'),
('usdt_rate', '1.00', 'USDT exchange rate'),
('min_recharge', '10', 'Minimum recharge amount'),
('min_withdraw', '50', 'Minimum withdraw amount');

-- Additional tables for complete platform

-- Evaluations/Reviews table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  rating INT DEFAULT 5,
  comment TEXT,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  coin VARCHAR(20),
  blockchain_name VARCHAR(50),
  address TEXT,
  fee DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recharges table
CREATE TABLE IF NOT EXISTS recharges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  coin VARCHAR(20),
  blockchain_name VARCHAR(50),
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order logs table
CREATE TABLE IF NOT EXISTS order_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  action VARCHAR(50),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lottery table
CREATE TABLE IF NOT EXISTS lotteries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  prize TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity/heartbeat table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Add more blockchain channels
INSERT INTO blockchain_channels (coin, blockchain_name, fee, is_active) VALUES
('USDC', 'TRC20', 1.00, true),
('ETH', 'ERC20', 1909.04, true),
('BTC', 'BTC', 64707.28, true);

-- Add more system params
INSERT INTO system_params (code, value, description) VALUES
('usdt_rate', '1.00', 'USDT exchange rate'),
('min_recharge', '10', 'Minimum recharge amount'),
('min_withdraw', '50', 'Minimum withdraw amount'),
('lottery_enabled', 'true', 'Enable lottery feature'),
('chat_enabled', 'true', 'Enable live chat'),
('subscribe_enabled', 'true', 'Enable newsletter subscription');
