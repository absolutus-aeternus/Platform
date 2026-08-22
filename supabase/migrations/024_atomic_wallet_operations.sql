-- Migration 024: Atomic wallet operations to prevent double-spending
-- Fixes BUG-001 (wallet payment race condition) and BUG-002 (payout race condition)

-- Atomic wallet deduction: only deducts if sufficient balance
CREATE OR REPLACE FUNCTION atomic_deduct_wallet(
  p_user_id UUID,
  p_amount NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_wallet_id UUID;
  v_new_balance NUMERIC;
BEGIN
  -- Lock the wallet row and deduct atomically
  UPDATE wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND balance >= p_amount
  RETURNING id, balance INTO v_wallet_id, v_new_balance;

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance or wallet not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'wallet_id', v_wallet_id,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic seller wallet deduction for payouts
CREATE OR REPLACE FUNCTION atomic_deduct_seller_wallet(
  p_seller_id UUID,
  p_amount NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_wallet_id UUID;
  v_new_balance NUMERIC;
BEGIN
  UPDATE seller_wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE seller_id = p_seller_id
    AND balance >= p_amount
  RETURNING id, balance INTO v_wallet_id, v_new_balance;

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance or wallet not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'wallet_id', v_wallet_id,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic seller wallet credit (for rejected payout refund)
CREATE OR REPLACE FUNCTION atomic_credit_seller_wallet(
  p_seller_id UUID,
  p_amount NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_wallet_id UUID;
  v_new_balance NUMERIC;
BEGIN
  UPDATE seller_wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE seller_id = p_seller_id
  RETURNING id, balance INTO v_wallet_id, v_new_balance;

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Wallet not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'wallet_id', v_wallet_id,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process checkout atomically (prevents stock race conditions)
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
  p_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product RECORD;
  v_item_price NUMERIC;
  v_calculated_total NUMERIC := 0;
  v_is_duplicate BOOLEAN := false;
BEGIN
  -- Check idempotency
  SELECT id INTO v_order_id
  FROM orders
  WHERE notes LIKE '%' || p_idempotency_key || '%'
    AND user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_order_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'order_id', v_order_id,
      'is_duplicate', true
    );
  END IF;

  -- Validate and lock each product, check stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Lock product row for update
    SELECT id, price, stock, name INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF v_product.id IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_item->>'product_id';
    END IF;

    IF v_product.stock < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Insufficient stock for product: % (available: %, requested: %)',
        v_product.name, v_product.stock, v_item->>'quantity';
    END IF;

    -- Use server-side price, not client-sent price
    v_item_price := v_product.price;
    v_calculated_total := v_calculated_total + (v_item_price * (v_item->>'quantity')::INT);

    -- Deduct stock atomically
    UPDATE products
    SET stock = stock - (v_item->>'quantity')::INT,
        sales_count = sales_count + (v_item->>'quantity')::INT
    WHERE id = v_product.id;
  END LOOP;

  -- Create order with server-calculated total
  INSERT INTO orders (
    user_id, seller_id, order_no, total_amount,
    shipping_fee, payment_method, shipping_address,
    notes, status, payment_status
  ) VALUES (
    p_user_id, p_seller_id, p_order_no,
    v_calculated_total + p_shipping_fee,
    p_shipping_fee, p_payment_method, p_shipping_address,
    p_notes || ' | idempotency:' || p_idempotency_key,
    'pending', 'pending'
  ) RETURNING id INTO v_order_id;

  -- Create order items with server-side prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price INTO v_item_price
    FROM products WHERE id = (v_item->>'product_id')::UUID;

    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INT,
      v_item_price
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'is_duplicate', false,
    'server_total', v_calculated_total + p_shipping_fee
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
