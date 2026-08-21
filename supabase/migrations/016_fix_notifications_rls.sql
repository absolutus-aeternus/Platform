-- Migration 016: Fix notifications RLS policy
-- The previous policy "notifications_insert" WITH CHECK (true) allowed ANY authenticated user
-- to insert notifications for ANY other user. This is a security vulnerability.
-- Fix: restrict inserts to own user_id only, or via service role (admin/worker).

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;

-- Create restricted policy: users can only insert notifications for themselves
CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: The Worker API uses service role key which bypasses RLS,
-- so server-side notification creation (order updates, system alerts) still works.
