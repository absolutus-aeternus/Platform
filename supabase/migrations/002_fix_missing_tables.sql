-- ============================================================
-- Fix Missing Tables: bank_cards, coupons
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. BANK CARDS TABLE
CREATE TABLE IF NOT EXISTS public.bank_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  bank_name TEXT,
  last_four TEXT,
  holder_name TEXT,
  card_type TEXT DEFAULT 'debit',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bank_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "bank_cards_select" ON public.bank_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bank_cards_insert" ON public.bank_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bank_cards_update" ON public.bank_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bank_cards_delete" ON public.bank_cards FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_bank_cards_user ON public.bank_cards(user_id);


-- 2. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.sellers(id),
  code TEXT NOT NULL,
  discount_type TEXT DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(12,2) NOT NULL,
  min_order NUMERIC(12,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read, seller write)
CREATE POLICY "coupons_select" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "coupons_insert" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "coupons_update" ON public.coupons FOR UPDATE USING (true);
CREATE POLICY "coupons_delete" ON public.coupons FOR DELETE USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_coupons_seller ON public.coupons(seller_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);


-- 3. FIX ORDERS TABLE - add seller_id if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'seller_id') THEN
    ALTER TABLE public.orders ADD COLUMN seller_id UUID REFERENCES public.sellers(id);
  END IF;
END $$;


-- 4. Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bank_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
