-- Migration 022: Comprehensive RLS Policies & Missing Indexes
-- Date: 2026-08-21
-- Fixes: 24 tables without RLS policies, 20+ missing foreign key indexes
-- Target: 100% RLS coverage, optimal query performance

-- ============================================================
-- PART 1: RLS POLICIES FOR ALL UNPROTECTED TABLES
-- ============================================================

-- 1. bank_cards: users manage own cards
ALTER TABLE bank_cards ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bank_cards' AND policyname = 'bank_cards_user_all') THEN
    CREATE POLICY "bank_cards_user_all" ON bank_cards FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. commissions: sellers see own, admins see all
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commissions' AND policyname = 'commissions_seller_read') THEN
    CREATE POLICY "commissions_seller_read" ON commissions FOR SELECT USING (
      seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commissions' AND policyname = 'commissions_admin_all') THEN
    CREATE POLICY "commissions_admin_all" ON commissions FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 3. complaints: users see own, admins see all
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'complaints_user_read') THEN
    CREATE POLICY "complaints_user_read" ON complaints FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'complaints_user_insert') THEN
    CREATE POLICY "complaints_user_insert" ON complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'complaints_admin_all') THEN
    CREATE POLICY "complaints_admin_all" ON complaints FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 4. coupons: public read active, admins manage
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'coupons_public_read') THEN
    CREATE POLICY "coupons_public_read" ON coupons FOR SELECT USING (
      is_active = TRUE AND (starts_at IS NULL OR starts_at <= NOW()) AND (expires_at IS NULL OR expires_at >= NOW())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'coupons_admin_all') THEN
    CREATE POLICY "coupons_admin_all" ON coupons FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 5. feed_events: users see own, public read
ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_events' AND policyname = 'feed_events_public_read') THEN
    CREATE POLICY "feed_events_public_read" ON feed_events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_events' AND policyname = 'feed_events_user_insert') THEN
    CREATE POLICY "feed_events_user_insert" ON feed_events FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. followed_sellers: users manage own
ALTER TABLE followed_sellers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'followed_sellers' AND policyname = 'followed_sellers_user_all') THEN
    CREATE POLICY "followed_sellers_user_all" ON followed_sellers FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. follows: users manage own, sellers see followers
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'follows_user_all') THEN
    CREATE POLICY "follows_user_all" ON follows FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'follows_seller_read') THEN
    CREATE POLICY "follows_seller_read" ON follows FOR SELECT USING (
      seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
    );
  END IF;
END $$;

-- 8. payments: users see own, admins see all
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'payments_user_read') THEN
    CREATE POLICY "payments_user_read" ON payments FOR SELECT USING (
      order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'payments_admin_all') THEN
    CREATE POLICY "payments_admin_all" ON payments FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 9. payouts: sellers see own, admins manage
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'payouts_seller_read') THEN
    CREATE POLICY "payouts_seller_read" ON payouts FOR SELECT USING (
      seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'payouts_admin_all') THEN
    CREATE POLICY "payouts_admin_all" ON payouts FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 10. platform_settings: admin-only
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_settings' AND policyname = 'platform_settings_admin_all') THEN
    CREATE POLICY "platform_settings_admin_all" ON platform_settings FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 11. product_comments: public read, authenticated insert, own delete
ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_comments' AND policyname = 'product_comments_public_read') THEN
    CREATE POLICY "product_comments_public_read" ON product_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_comments' AND policyname = 'product_comments_auth_insert') THEN
    CREATE POLICY "product_comments_auth_insert" ON product_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_comments' AND policyname = 'product_comments_user_delete') THEN
    CREATE POLICY "product_comments_user_delete" ON product_comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 12. product_variants: public read, sellers manage own
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'product_variants_public_read') THEN
    CREATE POLICY "product_variants_public_read" ON product_variants FOR SELECT USING (is_active = TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'product_variants_seller_manage') THEN
    CREATE POLICY "product_variants_seller_manage" ON product_variants FOR ALL USING (
      product_id IN (SELECT p.id FROM products p JOIN sellers s ON p.seller_id = s.id WHERE s.user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'product_variants_admin_manage') THEN
    CREATE POLICY "product_variants_admin_manage" ON product_variants FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 13. profiles: users see own, admins see all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_user_read') THEN
    CREATE POLICY "profiles_user_read" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_user_update') THEN
    CREATE POLICY "profiles_user_update" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_admin_read') THEN
    CREATE POLICY "profiles_admin_read" ON profiles FOR SELECT USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 14-18. Rating Plus tables: users see own, admins see all
ALTER TABLE rating_plus_users ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_users' AND policyname = 'rplus_users_own') THEN
    CREATE POLICY "rplus_users_own" ON rating_plus_users FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_users' AND policyname = 'rplus_users_admin') THEN
    CREATE POLICY "rplus_users_admin" ON rating_plus_users FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

ALTER TABLE rating_plus_tasks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_tasks' AND policyname = 'rplus_tasks_public_read') THEN
    CREATE POLICY "rplus_tasks_public_read" ON rating_plus_tasks FOR SELECT USING (is_active = TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_tasks' AND policyname = 'rplus_tasks_admin') THEN
    CREATE POLICY "rplus_tasks_admin" ON rating_plus_tasks FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

ALTER TABLE rating_plus_task_completions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_task_completions' AND policyname = 'rplus_completions_own') THEN
    CREATE POLICY "rplus_completions_own" ON rating_plus_task_completions FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_task_completions' AND policyname = 'rplus_completions_admin') THEN
    CREATE POLICY "rplus_completions_admin" ON rating_plus_task_completions FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

ALTER TABLE rating_plus_chat_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_chat_messages' AND policyname = 'rplus_chat_own') THEN
    CREATE POLICY "rplus_chat_own" ON rating_plus_chat_messages FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_chat_messages' AND policyname = 'rplus_chat_admin') THEN
    CREATE POLICY "rplus_chat_admin" ON rating_plus_chat_messages FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

ALTER TABLE rating_plus_withdrawals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_withdrawals' AND policyname = 'rplus_withdrawals_own') THEN
    CREATE POLICY "rplus_withdrawals_own" ON rating_plus_withdrawals FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rating_plus_withdrawals' AND policyname = 'rplus_withdrawals_admin') THEN
    CREATE POLICY "rplus_withdrawals_admin" ON rating_plus_withdrawals FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 19. review_validations: users see own, admins see all
ALTER TABLE review_validations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_validations' AND policyname = 'review_validations_user_read') THEN
    CREATE POLICY "review_validations_user_read" ON review_validations FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_validations' AND policyname = 'review_validations_admin_all') THEN
    CREATE POLICY "review_validations_admin_all" ON review_validations FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 20. reviews: public read, authenticated insert, own delete
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'reviews_public_read') THEN
    CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'reviews_auth_insert') THEN
    CREATE POLICY "reviews_auth_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'reviews_user_delete') THEN
    CREATE POLICY "reviews_user_delete" ON reviews FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 21. seller_products: sellers manage own, public read
ALTER TABLE seller_products ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_products' AND policyname = 'seller_products_public_read') THEN
    CREATE POLICY "seller_products_public_read" ON seller_products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_products' AND policyname = 'seller_products_seller_manage') THEN
    CREATE POLICY "seller_products_seller_manage" ON seller_products FOR ALL USING (
      seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_products' AND policyname = 'seller_products_admin_manage') THEN
    CREATE POLICY "seller_products_admin_manage" ON seller_products FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 22. seller_wallets: sellers see own, admins see all
ALTER TABLE seller_wallets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_wallets' AND policyname = 'seller_wallets_seller_read') THEN
    CREATE POLICY "seller_wallets_seller_read" ON seller_wallets FOR SELECT USING (
      seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_wallets' AND policyname = 'seller_wallets_admin_all') THEN
    CREATE POLICY "seller_wallets_admin_all" ON seller_wallets FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 23. shipping_rates: public read, sellers manage own
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shipping_rates' AND policyname = 'shipping_rates_public_read') THEN
    CREATE POLICY "shipping_rates_public_read" ON shipping_rates FOR SELECT USING (is_active = TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shipping_rates' AND policyname = 'shipping_rates_seller_manage') THEN
    CREATE POLICY "shipping_rates_seller_manage" ON shipping_rates FOR ALL USING (
      seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shipping_rates' AND policyname = 'shipping_rates_admin_manage') THEN
    CREATE POLICY "shipping_rates_admin_manage" ON shipping_rates FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- 24. user_activity: users see own, admins see all
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity' AND policyname = 'user_activity_user_read') THEN
    CREATE POLICY "user_activity_user_read" ON user_activity FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity' AND policyname = 'user_activity_system_insert') THEN
    CREATE POLICY "user_activity_system_insert" ON user_activity FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity' AND policyname = 'user_activity_admin_read') THEN
    CREATE POLICY "user_activity_admin_read" ON user_activity FOR SELECT USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- ============================================================
-- PART 2: MISSING FOREIGN KEY INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_approved_by ON sellers(approved_by);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_seller_id ON chat_messages(seller_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_variant_id ON evaluations(variant_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_order_id ON evaluations(order_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_approved_by ON withdrawals(approved_by);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_recharges_user_id ON recharges(user_id);
CREATE INDEX IF NOT EXISTS idx_order_logs_order_id ON order_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_user_id ON product_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_product_id ON product_comments(product_id);
CREATE INDEX IF NOT EXISTS idx_review_validations_user_id ON review_validations(user_id);
CREATE INDEX IF NOT EXISTS idx_review_validations_review_id ON review_validations(review_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_seller_id ON seller_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_product_id ON seller_products(product_id);
CREATE INDEX IF NOT EXISTS idx_seller_wallets_seller_id ON seller_wallets(seller_id);
CREATE INDEX IF NOT EXISTS idx_commissions_seller_id ON commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_payouts_seller_id ON payouts(seller_id);
CREATE INDEX IF NOT EXISTS idx_followed_sellers_user_id ON followed_sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_followed_sellers_seller_id ON followed_sellers(seller_id);
CREATE INDEX IF NOT EXISTS idx_feed_events_user_id ON feed_events(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_bank_cards_user_id ON bank_cards(user_id);

-- ============================================================
-- PART 3: PERFORMANCE INDEXES FOR COMMON QUERIES
-- ============================================================

-- Composite indexes for common filter patterns
CREATE INDEX IF NOT EXISTS idx_products_status_created ON products(status, created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_products_category_created ON products(category_id, created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_product_created ON evaluations(product_id, created_at DESC);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_coupons_active_code ON coupons(code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sellers_approved ON sellers(id) WHERE approval_status = 'approved';
CREATE INDEX IF NOT EXISTS idx_products_active ON products(id) WHERE status = 'published';

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- Run after migration to verify all tables have RLS policies
-- SELECT t.tablename, COUNT(p.policyname) as policy_count
-- FROM pg_tables t
-- LEFT JOIN pg_policies p ON t.tablename = p.tablename
-- WHERE t.schemaname = 'public'
-- GROUP BY t.tablename
-- ORDER BY policy_count ASC, t.tablename;
