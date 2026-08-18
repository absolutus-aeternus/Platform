-- Commission System for AllianceHub Dropship Platform
-- Created: 2026-08-18

-- 1. Products: add cost basis and commission fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_seller_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_seller_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS platform_commission_rate DECIMAL(5,4) DEFAULT 0.05;

-- 2. Seller Products: seller-level markup/pricing
CREATE TABLE IF NOT EXISTS seller_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2),
  custom_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(seller_id, product_id)
);

-- 3. Commissions: all commission tracking
CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id),
  order_id UUID REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id),
  type TEXT NOT NULL CHECK (type IN ('sale', 'review', 'referral', 'bonus')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled', 'held')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  hold_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Platform Settings: configurable rates
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Default settings
INSERT INTO platform_settings (key, value) VALUES
  ('commission_rates', '{"default": 0.05, "premium": 0.03, "new_seller": 0.08}'::jsonb),
  ('review_commission', '{"base": 0.10, "photo_bonus": 0.05, "high_rating_bonus": 0.05, "helpful_bonus": 0.10, "max": 0.30}'::jsonb),
  ('withdrawal_limits', '{"min": 10, "max_daily": 1000, "processing_days": 3}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 5. Review Validations: anti-fraud tracking
CREATE TABLE IF NOT EXISTS review_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES evaluations(id),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  device_fingerprint TEXT,
  ip_address INET,
  is_suspicious BOOLEAN DEFAULT false,
  suspicion_reason TEXT,
  commission_status TEXT DEFAULT 'held' CHECK (commission_status IN ('held', 'released', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Payouts: seller withdrawal tracking
CREATE TABLE IF NOT EXISTS payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id),
  amount DECIMAL(10,2) NOT NULL,
  method TEXT CHECK (method IN ('bank_transfer', 'ewallet', 'crypto')),
  account_details JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Seller Wallets: track earnings
CREATE TABLE IF NOT EXISTS seller_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id) UNIQUE,
  balance DECIMAL(12,2) DEFAULT 0,
  pending_balance DECIMAL(12,2) DEFAULT 0,
  total_earned DECIMAL(12,2) DEFAULT 0,
  total_withdrawn DECIMAL(12,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commissions_seller ON commissions(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_order ON commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_commissions_type ON commissions(type, status);
CREATE INDEX IF NOT EXISTS idx_review_validations_user ON review_validations(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_review_validations_suspicious ON review_validations(is_suspicious) WHERE is_suspicious = true;
CREATE INDEX IF NOT EXISTS idx_payouts_seller ON payouts(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_products_seller ON seller_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_product ON seller_products(product_id);

-- RLS Policies
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Sellers can view own commissions
CREATE POLICY "commissions_seller_read" ON commissions FOR SELECT USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);

-- Admins can view all commissions
CREATE POLICY "commissions_admin_read" ON commissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Sellers can manage own products
CREATE POLICY "seller_products_owner" ON seller_products FOR ALL USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);

-- Sellers can view own wallet
CREATE POLICY "wallet_owner_read" ON seller_wallets FOR SELECT USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);

-- Sellers can view own payouts
CREATE POLICY "payouts_owner_read" ON payouts FOR SELECT USING (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);

-- Sellers can create payout requests
CREATE POLICY "payouts_owner_insert" ON payouts FOR INSERT WITH CHECK (
  seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())
);

-- Only SUPER_ADMIN can modify platform settings
CREATE POLICY "settings_superadmin" ON platform_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN')
);

COMMENT ON TABLE commissions IS 'Tracks all seller commissions (sales, reviews, referrals)';
COMMENT ON TABLE seller_products IS 'Seller-level product customizations (markup, description)';
COMMENT ON TABLE platform_settings IS 'Global platform configuration (rates, limits)';
COMMENT ON TABLE review_validations IS 'Anti-fraud tracking for review commissions';
COMMENT ON TABLE payouts IS 'Seller withdrawal requests and processing';
COMMENT ON TABLE seller_wallets IS 'Seller earnings balance tracking';
