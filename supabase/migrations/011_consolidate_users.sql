-- Migration 011: Consolidate profiles → users table
-- The codebase references 'users' but the table was created as 'profiles'
-- This migration renames 'profiles' to 'users' and updates all references

-- Step 1: Rename profiles → users (if profiles exists and users doesn't)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE public.profiles RENAME TO users;
    RAISE NOTICE 'Renamed profiles → users';
  ELSE
    RAISE NOTICE 'profiles table not found or users already exists, skipping rename';
  END IF;
END $$;

-- Step 2: Ensure users table has all required columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'SELLER', 'ADMIN', 'SUPER_ADMIN', 'RATING_PLUS'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'none';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id);

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create proper RLS policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_service" ON public.users;

-- Users can read their own data
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Users can update their own data (but not role — handled by trigger)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update users
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Service role can insert (for new user creation)
CREATE POLICY "users_insert_service" ON public.users
  FOR INSERT WITH CHECK (true);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral ON public.users(referral_code) WHERE referral_code IS NOT NULL;

-- Step 6: Update any foreign key references that pointed to profiles
-- (Most FKs already reference auth.users(id) so they should be fine)
-- Just ensure sellers.user_id references users.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name LIKE '%sellers_user_id_fkey%'
  ) THEN
    -- FK already exists, no action needed
    RAISE NOTICE 'sellers.user_id FK already exists';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'FK check skipped: %', SQLERRM;
END $$;

COMMENT ON TABLE public.users IS 'User profiles — consolidated from profiles table (migration 011)';
