-- Migration 013: Fix Critical Bugs (Atomic Checkout, Idempotency, Stock Integrity)

-- ============================================================
-- 1. ATOMIC CHECKOUT FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION process_checkout(
  p_user_id UUID,
  p_seller_id UUID,
  p_order_no TEXT,
  p_total_amount NUMERIC,
  p_shipping_fee NUMERIC,
  p_payment_method TEXT,
  p_shipping_address JSONB,
  p_notes TEXT,
  p_idempotency_key TEXT,
  p_items JSONB -- Array of {product_id, quantity, price, name}
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
  v_existing_order_id UUID;
BEGIN
  -- 1. Check Idempotency
  SELECT id INTO v_existing_order_id FROM orders WHERE idempotency_key = p_idempotency_key;
  IF v_existing_order_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'order_id', v_existing_order_id, 'is_duplicate', true);
  END IF;

  -- 2. Create Order
  INSERT INTO orders (
    user_id, seller_id, order_no, total_amount, shipping_fee, 
    payment_method, shipping_address, notes, idempotency_key, status, payment_status
  ) VALUES (
    p_user_id, p_seller_id, p_order_no, p_total_amount, p_shipping_fee, 
    p_payment_method, p_shipping_address, p_notes, p_idempotency_key, 'pending', 'unpaid'
  ) RETURNING id INTO v_order_id;

  -- 3. Process Items & Decrement Stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;

    -- A. Insert Order Item
    INSERT INTO order_items (
      order_id, product_id, product_name, product_price, quantity, total_price
    ) VALUES (
      v_order_id, v_product_id, v_item->>'name', (v_item->>'price')::NUMERIC, v_quantity, (v_item->>'price')::NUMERIC * v_quantity
    );

    -- B. Atomic Stock Decrement with Check
    UPDATE products 
    SET stock = stock - v_quantity 
    WHERE id = v_product_id AND (stock IS NULL OR stock >= v_quantity);

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'name';
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'is_duplicate', false);

EXCEPTION
  WHEN OTHERS THEN
    -- Transaction will automatically rollback on exception
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. SECURE SYSTEM PARAMS
-- ============================================================
-- Ensure system_params is only readable by authenticated users
ALTER TABLE system_params ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read system_params" ON system_params;
CREATE POLICY "Auth read system_params" ON system_params FOR SELECT TO authenticated USING (true);
