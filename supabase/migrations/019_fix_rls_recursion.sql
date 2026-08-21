-- Fix infinite recursion: use SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop the recursive policy
DROP POLICY IF EXISTS "system_params_admin_all" ON public.system_params;

-- Recreate with function (avoids recursion)
CREATE POLICY "system_params_admin_all" ON public.system_params
  FOR ALL USING (public.get_user_role() IN ('ADMIN', 'SUPER_ADMIN'));
