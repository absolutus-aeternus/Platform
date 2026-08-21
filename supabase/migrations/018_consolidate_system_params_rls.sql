-- Migration 018: Consolidate system_params RLS policies
-- Migration 014 created "system_params_deny_anon" (FOR SELECT USING false)
-- Migration 015 created "system_params_admin" (FOR ALL USING admin check)
-- Both policies coexist — confusing but functional (OR logic in PG RLS).
-- This migration consolidates into clear, non-conflicting policies.

-- Drop both existing policies
DROP POLICY IF EXISTS "system_params_deny_anon" ON public.system_params;
DROP POLICY IF EXISTS "system_params_admin" ON public.system_params;

-- Admin/SuperAdmin can do everything
CREATE POLICY "system_params_admin_all" ON public.system_params
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Deny anonymous access explicitly
CREATE POLICY "system_params_deny_anon" ON public.system_params
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
