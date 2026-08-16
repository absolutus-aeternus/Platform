-- RLS Security Hardening Migration
-- Enable RLS on all tables and add proper policies

-- Helper functions
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('ADMIN', 'SUPER_ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_seller()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'SELLER'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══ USERS TABLE ═══
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Super admins can delete users" ON users;
CREATE POLICY "Super admins can delete users" ON users
  FOR DELETE TO authenticated USING (is_super_admin());

-- ═══ PRODUCTS TABLE ═══
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active products" ON products;
CREATE POLICY "Anyone can read active products" ON products
  FOR SELECT USING (status = 'active' OR is_admin());

DROP POLICY IF EXISTS "Sellers can insert own products" ON products;
CREATE POLICY "Sellers can insert own products" ON products
  FOR INSERT TO authenticated WITH CHECK (
    is_seller() AND seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Sellers can update own products" ON products;
CREATE POLICY "Sellers can update own products" ON products
  FOR UPDATE TO authenticated
  USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()))
  WITH CHECK (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all products" ON products;
CREATE POLICY "Admins can manage all products" ON products
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ═══ ORDERS TABLE ═══
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ═══ ORDER ITEMS TABLE ═══
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT TO authenticated USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT TO authenticated WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

-- ═══ CART ITEMS TABLE ═══
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══ SELLERS TABLE ═══
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active sellers" ON sellers;
CREATE POLICY "Anyone can read active sellers" ON sellers
  FOR SELECT USING (status = 'active' OR is_admin());

DROP POLICY IF EXISTS "Sellers can update own profile" ON sellers;
CREATE POLICY "Sellers can update own profile" ON sellers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ═══ CATEGORIES TABLE ═══
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (is_active = true OR is_admin());

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ═══ FAVORITES TABLE ═══
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══ ADDRESSES TABLE ═══
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══ WALLETS TABLE ═══
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own wallet" ON wallets;
CREATE POLICY "Users can read own wallet" ON wallets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage wallets" ON wallets;
CREATE POLICY "Admins can manage wallets" ON wallets
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ═══ RECHARGES TABLE ═══
ALTER TABLE recharges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own recharges" ON recharges;
CREATE POLICY "Users can read own recharges" ON recharges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recharges" ON recharges;
CREATE POLICY "Users can insert own recharges" ON recharges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ═══ WITHDRAWALS TABLE ═══
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own withdrawals" ON withdrawals;
CREATE POLICY "Users can read own withdrawals" ON withdrawals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawals;
CREATE POLICY "Users can insert own withdrawals" ON withdrawals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ═══ NOTIFICATIONS TABLE ═══
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══ CHAT MESSAGES TABLE ═══
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own chats" ON chat_messages;
CREATE POLICY "Users can read own chats" ON chat_messages
  FOR SELECT TO authenticated USING (
    sender_id = auth.uid() OR receiver_id = auth.uid() OR is_admin()
  );

DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- ═══ EVALUATIONS TABLE ═══
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read evaluations" ON evaluations;
CREATE POLICY "Anyone can read evaluations" ON evaluations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own evaluations" ON evaluations;
CREATE POLICY "Users can insert own evaluations" ON evaluations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ═══ BANNERS TABLE ═══
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active banners" ON banners;
CREATE POLICY "Anyone can read active banners" ON banners
  FOR SELECT USING (is_active = true OR is_admin());

DROP POLICY IF EXISTS "Admins can manage banners" ON banners;
CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ═══ COUPONS TABLE ═══
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons;
CREATE POLICY "Anyone can read active coupons" ON coupons
  FOR SELECT USING (is_active = true OR is_admin());

DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ═══ SYSTEM PARAMS TABLE ═══
ALTER TABLE system_params ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read system params" ON system_params;
CREATE POLICY "Anyone can read system params" ON system_params
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage system params" ON system_params;
CREATE POLICY "Admins can manage system params" ON system_params
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ═══ FLASH SALES TABLE ═══
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active flash sales" ON flash_sales;
CREATE POLICY "Anyone can read active flash sales" ON flash_sales
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage flash sales" ON flash_sales;
CREATE POLICY "Admins can manage flash sales" ON flash_sales
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ═══ LOGIN LOGS TABLE ═══
-- Only admins can read, anyone can insert (for logging)
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read login logs" ON login_logs;
CREATE POLICY "Admins can read login logs" ON login_logs
  FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Anyone can insert login logs" ON login_logs;
CREATE POLICY "Anyone can insert login logs" ON login_logs
  FOR INSERT WITH CHECK (true);

-- ═══ AUDIT LOGS TABLE ═══
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
CREATE POLICY "Admins can read audit logs" ON audit_logs
  FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Anyone can insert audit logs" ON audit_logs;
CREATE POLICY "Anyone can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);
