-- =====================================================
-- FIX RLS SECURITY - Proper policies based on auth.uid()
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wishlists ENABLE ROW LEVEL SECURITY;
-- favorites is a view (migration 012), skip RLS
ALTER TABLE IF EXISTS public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lotteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blockchain_channels ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Drop ALL existing permissive policies
-- =====================================================
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- =====================================================
-- USERS - users see own data, admins see all
-- =====================================================
CREATE POLICY "users_select_own" ON public.users FOR SELECT
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "users_update_own" ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- PRODUCTS - public read, seller/admin write
-- =====================================================
CREATE POLICY "products_select_public" ON public.products FOR SELECT
  USING (status = 'published' OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "products_insert_seller" ON public.products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.sellers WHERE user_id = auth.uid() AND id = seller_id) OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "products_update_seller" ON public.products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.sellers WHERE user_id = auth.uid() AND id = seller_id) OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- =====================================================
-- CATEGORIES - public read, admin write
-- =====================================================
CREATE POLICY "categories_select_public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin" ON public.categories FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- =====================================================
-- SELLERS - public read, own write
-- =====================================================
CREATE POLICY "sellers_select_public" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "sellers_update_own" ON public.sellers FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- =====================================================
-- CART ITEMS - own only
-- =====================================================
CREATE POLICY "cart_select_own" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_insert_own" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_update_own" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_delete_own" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ORDERS - own only, admin sees all
-- =====================================================
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ORDER ITEMS - via order ownership
-- =====================================================
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));

-- =====================================================
-- ADDRESSES - own only
-- =====================================================
CREATE POLICY "addresses_select_own" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_insert_own" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_update_own" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_delete_own" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- WALLETS - own only, admin sees all
-- =====================================================
CREATE POLICY "wallets_select_own" ON public.wallets FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- =====================================================
-- WISHLISTS - own only
-- =====================================================
CREATE POLICY "wishlists_own" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- RECHARGES - own only
-- =====================================================
CREATE POLICY "recharges_select_own" ON public.recharges FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "recharges_insert_own" ON public.recharges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- WITHDRAWALS - own only
-- =====================================================
CREATE POLICY "withdrawals_select_own" ON public.withdrawals FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "withdrawals_insert_own" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CHAT MESSAGES - sender/receiver only
-- =====================================================
CREATE POLICY "chat_select_own" ON public.chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));
CREATE POLICY "chat_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- =====================================================
-- NOTIFICATIONS - own only
-- =====================================================
CREATE POLICY "notifications_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);

-- =====================================================
-- EVALUATIONS - public read, own write
-- =====================================================
CREATE POLICY "reviews_select_public" ON public.evaluations FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.evaluations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- BANNERS - public read
-- =====================================================
CREATE POLICY "banners_select_public" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "banners_admin" ON public.banners FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- =====================================================
-- FLASH SALES - public read
-- =====================================================
CREATE POLICY "flash_sales_select" ON public.flash_sales FOR SELECT USING (true);

-- =====================================================
-- SYSTEM PARAMS - admin only
-- =====================================================
CREATE POLICY "system_params_admin" ON public.system_params FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- =====================================================
-- ORDER LOGS - via order ownership
-- =====================================================
CREATE POLICY "order_logs_select" ON public.order_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- =====================================================
-- LOTTERIES - public read
-- =====================================================
CREATE POLICY "lotteries_select" ON public.lotteries FOR SELECT USING (is_active = true);

-- =====================================================
-- SUBSCRIBERS - own insert
-- =====================================================
CREATE POLICY "subscribers_insert" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "subscribers_select_own" ON public.subscribers FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

-- =====================================================
-- BLOCKCHAIN CHANNELS - public read
-- =====================================================
CREATE POLICY "blockchain_select" ON public.blockchain_channels FOR SELECT USING (is_active = true);
