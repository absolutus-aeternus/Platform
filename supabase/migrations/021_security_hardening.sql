-- Migration 021: Security Hardening & Cleanup
-- Date: 2026-08-21
-- Fixes: C-1 (CSRF), C-2 (webhook), H-1 (schema drift), H-2 (duplicate favorites), M-2 (role escalation via direct update)

-- ============================================================
-- 1. ROLE ESCALATION PREVENTION (fix M-2)
-- Ensure users cannot update their own role via client API
-- The trigger already exists from migration 007, but let's verify
-- and add a stricter version that checks current_setting safely
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow role changes from service_role context
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if current role is service_role (set by Supabase for service key requests)
    IF current_setting('role', true) != 'service_role' THEN
      RAISE EXCEPTION 'Cannot change role via client API';
    END IF;
  END IF;
  -- Also prevent users from changing their own kyc_status or status
  IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status OR NEW.status IS DISTINCT FROM OLD.status THEN
    IF current_setting('role', true) != 'service_role' THEN
      RAISE EXCEPTION 'Cannot change status fields via client API';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS prevent_role_escalation ON users;
CREATE TRIGGER prevent_role_escalation
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_escalation();

-- ============================================================
-- 2. FAVORITES TABLE STATUS
-- favorites is a VIEW (alias for wishlists), no separate RLS needed
-- wishlists already has proper RLS policies
-- ============================================================

-- ============================================================
-- 3. ENSURE ALL CRITICAL TABLES HAVE RLS POLICIES
-- ============================================================

-- system_params: admin-only read/write
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_params' AND policyname = 'system_params_admin_read') THEN
    CREATE POLICY "system_params_admin_read" ON system_params FOR SELECT USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_params' AND policyname = 'system_params_admin_write') THEN
    CREATE POLICY "system_params_admin_write" ON system_params FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- audit_logs: admin-only read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'audit_logs_admin_read') THEN
    CREATE POLICY "audit_logs_admin_read" ON audit_logs FOR SELECT USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- login_logs: admin-only read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'login_logs' AND policyname = 'login_logs_admin_read') THEN
    CREATE POLICY "login_logs_admin_read" ON login_logs FOR SELECT USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'SUPER_ADMIN'))
    );
  END IF;
END $$;

-- ============================================================
-- 4. ADD PERFORMANCE INDEX FOR RLS QUERIES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_id_role ON users(id, role);

-- ============================================================
-- 5. ADD process_checkout RPC FUNCTION (atomic checkout)
-- ============================================================
CREATE OR REPLACE FUNCTION process_checkout(
  p_user_id UUID,
  p_seller_id UUID,
  p_order_no TEXT,
  p_total_amount DECIMAL,
  p_shipping_fee DECIMAL,
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
  v_is_duplicate BOOLEAN := FALSE;
BEGIN
  -- Check idempotency (prevent double-submit)
  IF EXISTS (SELECT 1 FROM orders WHERE order_no = p_order_no AND user_id = p_user_id) THEN
    SELECT id INTO v_order_id FROM orders WHERE order_no = p_order_no AND user_id = p_user_id;
    RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'is_duplicate', true);
  END IF;

  -- Validate stock for all items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, stock, name INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Product not found: ' || (v_item->>'product_id'));
    END IF;
    IF v_product.stock < (v_item->>'quantity')::INT THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock for: ' || v_product.name);
    END IF;
  END LOOP;

  -- Create order
  INSERT INTO orders (user_id, order_no, total_amount, shipping_fee, payment_method, shipping_address, notes, status, payment_status)
  VALUES (p_user_id, p_order_no, p_total_amount, p_shipping_fee, p_payment_method, p_shipping_address, p_notes, 'pending', 'pending')
  RETURNING id INTO v_order_id;

  -- Create order items and deduct stock atomically
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, quantity, price, name)
    VALUES (v_order_id, (v_item->>'product_id')::UUID, (v_item->>'quantity')::INT, (v_item->>'price')::DECIMAL, v_item->>'name');

    -- Deduct stock
    UPDATE products SET stock = stock - (v_item->>'quantity')::INT,
      sales_count = sales_count + (v_item->>'quantity')::INT
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;

  -- Clear user's cart
  DELETE FROM cart_items WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'is_duplicate', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration 021 complete: Security hardening applied
