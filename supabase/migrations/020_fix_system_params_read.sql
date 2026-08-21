-- Migration 020: Fix system_params RLS to allow authenticated reads
-- The current policy blocks ALL non-admin reads, which breaks feature flags,
-- settings loading, and other system_params reads for regular users.

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "system_params_admin_all" ON public.system_params;
DROP POLICY IF EXISTS "system_params_deny_anon" ON public.system_params;

-- Allow all authenticated users to READ system_params
CREATE POLICY "system_params_read_authenticated" ON public.system_params
  FOR SELECT TO authenticated USING (true);

-- Only ADMIN/SUPER_ADMIN can INSERT/UPDATE/DELETE
CREATE POLICY "system_params_write_admin" ON public.system_params
  FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY "system_params_update_admin" ON public.system_params
  FOR UPDATE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY "system_params_delete_admin" ON public.system_params
  FOR DELETE TO authenticated USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- Block anonymous access entirely
CREATE POLICY "system_params_deny_anon" ON public.system_params
  FOR ALL TO anon USING (false);
