-- Atomic stock decrement function (prevents race condition)
-- BUG-001 + BUG-004 FIX

CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INT)
RETURNS TABLE(success BOOLEAN, remaining_stock INT, error_msg TEXT) AS $$
DECLARE
  v_current_stock INT;
BEGIN
  -- Lock the product row and get current stock
  SELECT stock INTO v_current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;
  
  -- Product not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Product not found'::TEXT;
    RETURN;
  END IF;
  
  -- Stock is NULL (unlimited)
  IF v_current_stock IS NULL THEN
    RETURN QUERY SELECT true, NULL, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Insufficient stock
  IF v_current_stock < p_quantity THEN
    RETURN QUERY SELECT false, v_current_stock, 
      format('Insufficient stock. Available: %s, Requested: %s', v_current_stock, p_quantity)::TEXT;
    RETURN;
  END IF;
  
  -- Decrement stock atomically
  UPDATE products
  SET stock = stock - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;
  
  RETURN QUERY SELECT true, v_current_stock - p_quantity, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INT) TO service_role;

-- Add idempotency_key column to orders (BUG-003 FIX)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
