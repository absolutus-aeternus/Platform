-- Add SUPER_ADMIN role to profiles table
-- This migration updates the role constraint to include SUPER_ADMIN

-- Update the CHECK constraint on profiles.role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('MEMBER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'));

-- Update RLS policies to allow SUPER_ADMIN full access
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('ADMIN', 'SUPER_ADMIN')
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Admins and Super Admins can read all profiles
CREATE POLICY admin_read_profiles ON profiles
  FOR SELECT USING (is_admin());

-- Policy: Admins and Super Admins can update all profiles
CREATE POLICY admin_update_profiles ON profiles
  FOR UPDATE USING (is_admin());

-- Policy: Only Super Admins can delete profiles
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'SUPER_ADMIN'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY super_admin_delete_profiles ON profiles
  FOR DELETE USING (is_super_admin());
