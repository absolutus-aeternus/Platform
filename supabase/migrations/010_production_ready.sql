-- Production-Ready Schema Updates for AllianceHub
-- Migration 010: Coupons, Follows, Product Variants, Shipping Rates, Reviews enhancement, Performance Indexes

-- ============================================================
-- 1. COUPONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  value DECIMAL(10,2) NOT NULL CHECK (value >= 0),
  min_order DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  max_uses INT,
  used_count INT DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. FOLLOWS TABLE (user follows seller)
-- ============================================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, seller_id)
);

-- ============================================================
-- 3. PRODUCT VARIANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(10,2),
  stock INT DEFAULT 0,
  attributes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. SHIPPING RATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  courier TEXT NOT NULL,
  service TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'domestic',
  rate DECIMAL(10,2) NOT NULL,
  estimated_days INT NOT NULL DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seller_id, courier, service, region)
);

-- ============================================================
-- 5. ENHANCE EVALUATIONS (REVIEWS) TABLE
-- ============================================================
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS helpful_count INT DEFAULT 0;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT FALSE;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS seller_reply TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS seller_replied_at TIMESTAMPTZ;

-- ============================================================
-- 6. ENHANCE WISHLISTS TABLE (if columns missing)
-- ============================================================
-- wishlists table already exists from 001_init.sql with UNIQUE(user_id, product_id)
-- No changes needed — already has the correct schema.

-- ============================================================
-- 7. PERFORMANCE INDEXES
-- ============================================================

-- Products: category + status filter (most common query)
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sales ON products(sales_count DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL;

-- Orders: user + status filter
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Evaluations (reviews): product lookup
CREATE INDEX IF NOT EXISTS idx_evaluations_product ON evaluations(product_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_user ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_rating ON evaluations(product_id, rating);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, starts_at, expires_at);

-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_seller ON follows(seller_id);

-- Product variants
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku) WHERE sku IS NOT NULL;

-- Shipping rates
CREATE INDEX IF NOT EXISTS idx_shipping_rates_seller ON shipping_rates(seller_id, is_active);

-- Cart items
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Wishlists
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

-- ============================================================
-- 8. RLS POLICIES FOR NEW TABLES
-- ============================================================

-- Coupons: public can read active, admins can manage
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_public_read" ON coupons
  FOR SELECT USING (
    is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW())
  );

CREATE POLICY "coupons_admin_all" ON coupons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Follows: users manage own follows, sellers can see followers
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_user_read" ON follows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "follows_user_insert" ON follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "follows_user_delete" ON follows
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "follows_seller_read" ON follows
  FOR SELECT USING (
    seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  );

-- Product variants: public read, sellers manage own
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "variants_public_read" ON product_variants
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "variants_seller_manage" ON product_variants
  FOR ALL USING (
    product_id IN (
      SELECT p.id FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE s.user_id = auth.uid()
    )
  );

CREATE POLICY "variants_admin_manage" ON product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Shipping rates: public read, sellers manage own
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shipping_rates_public_read" ON shipping_rates
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "shipping_rates_seller_manage" ON shipping_rates
  FOR ALL USING (
    seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
  );

-- ============================================================
-- 9. HELPER FUNCTIONS
-- ============================================================

-- Function to get follower count for a seller
CREATE OR REPLACE FUNCTION get_seller_follower_count(p_seller_id UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM follows WHERE seller_id = p_seller_id;
$$ LANGUAGE sql STABLE;

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code TEXT,
  p_order_total DECIMAL
) RETURNS TABLE(
  valid BOOLEAN,
  coupon_id UUID,
  discount_type TEXT,
  discount_value DECIMAL,
  discount_amount DECIMAL,
  error_msg TEXT
) AS $$
DECLARE
  v_coupon RECORD;
  v_discount DECIMAL;
BEGIN
  -- Find coupon
  SELECT * INTO v_coupon FROM coupons
  WHERE code = UPPER(p_code) AND is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW());

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'Invalid or expired coupon code'::TEXT;
    RETURN;
  END IF;

  -- Check max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'Coupon usage limit reached'::TEXT;
    RETURN;
  END IF;

  -- Check minimum order
  IF p_order_total < v_coupon.min_order THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL,
      format('Minimum order amount is $%s', v_coupon.min_order)::TEXT;
    RETURN;
  END IF;

  -- Calculate discount
  IF v_coupon.type = 'percentage' THEN
    v_discount := p_order_total * (v_coupon.value / 100);
    IF v_coupon.max_discount IS NOT NULL THEN
      v_discount := LEAST(v_discount, v_coupon.max_discount);
    END IF;
  ELSIF v_coupon.type = 'fixed' THEN
    v_discount := LEAST(v_coupon.value, p_order_total);
  ELSE
    v_discount := 0; -- free_shipping handled separately
  END IF;

  RETURN QUERY SELECT true, v_coupon.id, v_coupon.type, v_coupon.value, v_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 10. SEED DATA: Default shipping rates
-- ============================================================
INSERT INTO shipping_rates (seller_id, courier, service, region, rate, estimated_days)
VALUES
  (NULL, 'Standard', 'Economy', 'domestic', 0, 14),
  (NULL, 'Standard', 'Regular', 'domestic', 4.99, 7),
  (NULL, 'Express', 'Express', 'domestic', 12.99, 3),
  (NULL, 'Premium', 'Next Day', 'domestic', 24.99, 1),
  (NULL, 'Standard', 'Economy', 'international', 9.99, 21),
  (NULL, 'Standard', 'Regular', 'international', 19.99, 14),
  (NULL, 'Express', 'Express', 'international', 34.99, 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. SEED DATA: Sample coupons
-- ============================================================
INSERT INTO coupons (code, type, value, min_order, max_uses, starts_at, expires_at)
VALUES
  ('WELCOME10', 'percentage', 10, 20, 1000, NOW(), NOW() + INTERVAL '90 days'),
  ('SAVE5', 'fixed', 5, 30, 500, NOW(), NOW() + INTERVAL '60 days'),
  ('FREESHIP', 'free_shipping', 0, 50, NULL, NOW(), NOW() + INTERVAL '365 days')
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE coupons IS 'Discount coupons with usage tracking and expiration';
COMMENT ON TABLE follows IS 'User-seller follow relationships';
COMMENT ON TABLE product_variants IS 'Product variants (size, color, etc.) with separate pricing/stock';
COMMENT ON TABLE shipping_rates IS 'Configurable shipping rates per seller/courier/region';
