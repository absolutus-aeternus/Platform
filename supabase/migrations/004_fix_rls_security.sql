-- ═══════════════════════════════════════════════════════════════
-- FIX RLS POLICIES — Proper security for AllianceHub
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── Helper: Drop all existing policies for a table ───
CREATE OR REPLACE FUNCTION drop_all_policies(tbl TEXT)
RETURNS VOID AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || tbl;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- PUBLIC READ TABLES (products, categories, sellers, banners)
-- Anyone can read, only authenticated writes
-- ═══════════════════════════════════════════════════════════════

-- PRODUCTS
SELECT drop_all_policies('products');
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "products_update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "products_delete" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- CATEGORIES
SELECT drop_all_policies('categories');
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- SELLERS
SELECT drop_all_policies('sellers');
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sellers_select" ON sellers FOR SELECT USING (true);
CREATE POLICY "sellers_insert" ON sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sellers_update" ON sellers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sellers_delete" ON sellers FOR DELETE USING (auth.uid() = user_id);

-- BANNERS
SELECT drop_all_policies('banners');
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_select" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "banners_manage" ON banners FOR ALL USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════
-- USER-OWNED TABLES (cart, orders, favorites, addresses, etc.)
-- Users can only see/modify their own data
-- ═══════════════════════════════════════════════════════════════

-- CART ITEMS
SELECT drop_all_policies('cart_items');
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_select" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_insert" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_update" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_delete" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- ORDERS
SELECT drop_all_policies('orders');
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- ORDER ITEMS (users can see items for their orders)
SELECT drop_all_policies('order_items');
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- FAVORITES
SELECT drop_all_policies('favorites');
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_select" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- ADDRESSES
SELECT drop_all_policies('addresses');
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_select" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_insert" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_update" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_delete" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS
SELECT drop_all_policies('notifications');
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- WALLETS
SELECT drop_all_policies('wallets');
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallets_select" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallets_update" ON wallets FOR UPDATE USING (auth.uid() = user_id);

-- RECHARGES
SELECT drop_all_policies('recharges');
ALTER TABLE recharges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recharges_select" ON recharges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recharges_insert" ON recharges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- WITHDRAWALS
SELECT drop_all_policies('withdrawals');
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "withdrawals_select" ON withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "withdrawals_insert" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CHAT MESSAGES
SELECT drop_all_policies('chat_messages');
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_select" ON chat_messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "chat_insert" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ═══════════════════════════════════════════════════════════════
-- RESTRICTED TABLES (users, reviews, flash_sales, etc.)
-- ═══════════════════════════════════════════════════════════════

-- USERS/PROFILES
SELECT drop_all_policies('users');
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- REVIEWS (public read, auth write)
SELECT drop_all_policies('evaluations');
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evaluations_select" ON evaluations FOR SELECT USING (true);
CREATE POLICY "evaluations_insert" ON evaluations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FLASH SALES (public read)
SELECT drop_all_policies('flash_sales');
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flash_sales_select" ON flash_sales FOR SELECT USING (true);

-- SYSTEM PARAMS (public read)
SELECT drop_all_policies('system_params');
ALTER TABLE system_params ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_params_select" ON system_params FOR SELECT USING (true);

-- LOTTERIES (public read)
SELECT drop_all_policies('lotteries');
ALTER TABLE lotteries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lotteries_select" ON lotteries FOR SELECT USING (true);

-- BLOCKCHAIN CHANNELS (public read)
SELECT drop_all_policies('blockchain_channels');
ALTER TABLE blockchain_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blockchain_channels_select" ON blockchain_channels FOR SELECT USING (is_active = true);

-- ─── Cleanup ───
DROP FUNCTION IF EXISTS drop_all_policies(TEXT);

-- ─── Verify ───
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
