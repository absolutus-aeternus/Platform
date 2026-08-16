-- BUG #4 FIX: Prevent users from changing their own role
-- This policy ensures the role column cannot be updated by the user themselves

-- First, drop existing update policy if it conflicts
-- CREATE POLICY "Users can update own profile but NOT role" ON users
--   FOR UPDATE USING (auth.uid() = id)
--   WITH CHECK (
--     role = (SELECT role FROM users WHERE id = auth.uid())
--   );

-- Alternative: Use a trigger to prevent role changes
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role is being changed, check if the user is an admin
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow role changes by service_role (not by user themselves)
    IF current_setting(request.jwt.claims, true)::json->>role = service_role THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION Cannot change role via client API;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
DROP TRIGGER IF EXISTS prevent_role_escalation ON users;
CREATE TRIGGER prevent_role_escalation
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_escalation();

-- BUG #12 FIX: Ensure RLS is enabled on all sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
