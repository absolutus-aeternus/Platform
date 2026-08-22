-- Fix RLS Security: use auth.uid() properly
-- Products: public read, seller write own
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "products_seller_insert" ON products;
DROP POLICY IF EXISTS "products_seller_update" ON products;
DROP POLICY IF EXISTS "products_seller_delete" ON products;

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (status = 'active' OR status = 'published');
CREATE POLICY "products_seller_insert" ON products FOR INSERT WITH CHECK (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);
CREATE POLICY "products_seller_update" ON products FOR UPDATE USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);
CREATE POLICY "products_seller_delete" ON products FOR DELETE USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);

-- Categories: public read only
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);

-- Sellers: public read, owner update
DROP POLICY IF EXISTS "Anyone can view sellers" ON sellers;
CREATE POLICY "sellers_public_read" ON sellers FOR SELECT USING (true);
DROP POLICY IF EXISTS "sellers_owner_update" ON sellers;
CREATE POLICY "sellers_owner_update" ON sellers FOR UPDATE USING (auth.uid() = user_id);

-- Orders: owner-only
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "orders_owner_select" ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "orders_owner_insert" ON orders;
CREATE POLICY "orders_owner_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: owner of parent order
DROP POLICY IF EXISTS "order_items_owner_select" ON order_items;
CREATE POLICY "order_items_owner_select" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
DROP POLICY IF EXISTS "order_items_owner_insert" ON order_items;
CREATE POLICY "order_items_owner_insert" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Cart: owner-only
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
CREATE POLICY "cart_owner_all" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Addresses: owner-only
DROP POLICY IF EXISTS "addresses_owner_all" ON addresses;
CREATE POLICY "addresses_owner_all" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Favorites: owner-only
DROP POLICY IF EXISTS "favorites_owner_all" ON favorites;
CREATE POLICY "favorites_owner_all" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Notifications: owner-only
DROP POLICY IF EXISTS "notifications_owner_select" ON notifications;
CREATE POLICY "notifications_owner_select" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- Wallets: owner-only read
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "wallets_owner_select" ON wallets FOR SELECT USING (auth.uid() = user_id);

-- Chat: participants only
DROP POLICY IF EXISTS "chat_participants" ON chat_messages;
CREATE POLICY "chat_participants" ON chat_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "chat_sender_insert" ON chat_messages;
CREATE POLICY "chat_sender_insert" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Banners: public read
DROP POLICY IF EXISTS "banners_public_read" ON banners;
CREATE POLICY "banners_public_read" ON banners FOR SELECT USING (is_active = true);

-- Evaluations: public read, owner insert
DROP POLICY IF EXISTS "evaluations_public_read" ON evaluations;
CREATE POLICY "evaluations_public_read" ON evaluations FOR SELECT USING (true);
DROP POLICY IF EXISTS "evaluations_owner_insert" ON evaluations;
CREATE POLICY "evaluations_owner_insert" ON evaluations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flash sales: public read
DROP POLICY IF EXISTS "flash_sales_public_read" ON flash_sales;
CREATE POLICY "flash_sales_public_read" ON flash_sales FOR SELECT USING (is_active = true);

-- System params: deny anon
DROP POLICY IF EXISTS "system_params_deny_anon" ON system_params;
CREATE POLICY "system_params_deny_anon" ON system_params FOR SELECT USING (false);

-- Recharges: owner-only
DROP POLICY IF EXISTS "recharges_owner_all" ON recharges;
CREATE POLICY "recharges_owner_all" ON recharges FOR ALL USING (auth.uid() = user_id);

-- Withdrawals: owner-only
DROP POLICY IF EXISTS "withdrawals_owner_all" ON withdrawals;
CREATE POLICY "withdrawals_owner_all" ON withdrawals FOR ALL USING (auth.uid() = user_id);
