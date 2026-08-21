-- ============================================
-- FIX BUG #1: Enable RLS + Policies for ALL tables
-- ============================================

-- Enable RLS on all tables
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blockchain_channels ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: public read, seller write own
CREATE POLICY IF NOT EXISTS "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "products_seller_insert" ON products FOR INSERT WITH CHECK (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "products_seller_update" ON products FOR UPDATE USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "products_seller_delete" ON products FOR DELETE USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);

-- CATEGORIES: public read, admin write
CREATE POLICY IF NOT EXISTS "categories_public_read" ON categories FOR SELECT USING (true);

-- SELLERS: public read, owner update
CREATE POLICY IF NOT EXISTS "sellers_public_read" ON sellers FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "sellers_owner_update" ON sellers FOR UPDATE USING (auth.uid() = user_id);

-- ORDERS: user sees own only
CREATE POLICY IF NOT EXISTS "orders_user_read" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "orders_user_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ORDER ITEMS: user sees items of own orders
CREATE POLICY IF NOT EXISTS "order_items_user_read" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "order_items_user_insert" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- CART: user manages own cart
CREATE POLICY IF NOT EXISTS "cart_user_all" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- ADDRESSES: user manages own
CREATE POLICY IF NOT EXISTS "addresses_user_all" ON addresses FOR ALL USING (auth.uid() = user_id);

-- FAVORITES: user manages own
CREATE POLICY IF NOT EXISTS "favorites_user_all" ON favorites FOR ALL USING (auth.uid() = user_id);

-- EVALUATIONS: public read, user insert own
CREATE POLICY IF NOT EXISTS "evaluations_public_read" ON evaluations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "evaluations_user_insert" ON evaluations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS: user sees own
CREATE POLICY IF NOT EXISTS "notifications_user_read" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- WALLETS: user sees own
CREATE POLICY IF NOT EXISTS "wallets_user_read" ON wallets FOR SELECT USING (auth.uid() = user_id);

-- CHAT: user sees own messages
CREATE POLICY IF NOT EXISTS "chat_user_read" ON chat_messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY IF NOT EXISTS "chat_user_insert" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- BANNERS: public read
CREATE POLICY IF NOT EXISTS "banners_public_read" ON banners FOR SELECT USING (is_active = true);

-- RECHARGES: user sees own
CREATE POLICY IF NOT EXISTS "recharges_user_all" ON recharges FOR ALL USING (auth.uid() = user_id);

-- WITHDRAWALS: user sees own
CREATE POLICY IF NOT EXISTS "withdrawals_user_all" ON withdrawals FOR ALL USING (auth.uid() = user_id);

-- SYSTEM_PARAMS: admin only (deny all from anon)
CREATE POLICY IF NOT EXISTS "system_params_deny_anon" ON system_params FOR SELECT USING (false);

-- FLASH SALES: public read
CREATE POLICY IF NOT EXISTS "flash_sales_public_read" ON flash_sales FOR SELECT USING (true);

-- ORDER LOGS: user sees logs of own orders
CREATE POLICY IF NOT EXISTS "order_logs_user_read" ON order_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_logs.order_id AND orders.user_id = auth.uid())
);

-- LOTTERIES: public read
CREATE POLICY IF NOT EXISTS "lotteries_public_read" ON lotteries FOR SELECT USING (is_active = true);

-- SUBSCRIBERS: user manages own
CREATE POLICY IF NOT EXISTS "subscribers_user_all" ON subscribers FOR ALL USING (auth.uid() = user_id);

-- BLOCKCHAIN CHANNELS: public read
CREATE POLICY IF NOT EXISTS "blockchain_public_read" ON blockchain_channels FOR SELECT USING (is_active = true);
